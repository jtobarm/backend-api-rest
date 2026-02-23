let authToken = null;

// Registro
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('regUsername').value;
  const password = document.getElementById('regPassword').value;

  const res = await fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  document.getElementById('registerResult').textContent = JSON.stringify(data, null, 2);
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  document.getElementById('loginResult').textContent = JSON.stringify(data, null, 2);

  if (data.token) {
    authToken = data.token;
  }
});

// Cargar usuarios
document.getElementById('loadUsers').addEventListener('click', async () => {
  if (!authToken) {
    document.getElementById('usersResult').textContent = "Debes hacer login primero.";
    return;
  }

  const res = await fetch('http://localhost:3000/users', {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const users = await res.json();
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = '';

  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td><button onclick="deleteUser(${user.id})">Eliminar</button></td>
    `;
    tbody.appendChild(row);
  });
});

// Eliminar usuario
async function deleteUser(id) {
  const res = await fetch(`http://localhost:3000/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await res.json();
  document.getElementById('usersResult').textContent = JSON.stringify(data, null, 2);

  // Recargar lista
  document.getElementById('loadUsers').click();
}
