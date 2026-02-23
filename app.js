const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(express.json());

// Servir archivos estáticos (UI en carpeta public)
app.use(express.static(path.join(__dirname, 'public')));

// Simulación de base de datos en memoria
let users = [];

// Clave secreta para JWT (en proyectos reales se guarda en variables de entorno)
const SECRET_KEY = 'clave_secreta_super_segura';

// Endpoint de registro
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
  }

  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Usuario ya existe' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, username, password: hashedPassword };
  users.push(newUser);

  res.status(201).json({
    message: 'Usuario registrado con éxito',
    user: { id: newUser.id, username: newUser.username }
  });
});

// Endpoint de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(400).json({ message: 'Usuario no encontrado' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Contraseña incorrecta' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

  res.json({ message: 'Login exitoso', token });
});

// Middleware para verificar token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token requerido' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Endpoint protegido: lista de usuarios
app.get('/users', authenticateToken, (req, res) => {
  const safeUsers = users.map(u => ({ id: u.id, username: u.username }));
  res.json(safeUsers);
});

// Endpoint protegido: eliminar usuario por ID
app.delete('/users/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  const deletedUser = users.splice(userIndex, 1);
  res.json({ message: 'Usuario eliminado', user: { id: deletedUser[0].id, username: deletedUser[0].username } });
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

// Levantar servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});