document.addEventListener('DOMContentLoaded', () => {
  // Login
  if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      
      if (response.ok) window.location.href = '/users.html';
      else alert('Login failed');
    });
  }

  // Registration
  if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      
      if (response.ok) window.location.href = '/login.html';
      else alert('Registration failed');
    });
  }

  // User list and email composition
  if (document.getElementById('userList')) {
    fetch('/users')
      .then(res => res.json())
      .then(users => {
        let html = '<h2>Users</h2><ul>';
        users.forEach(user => {
          html += `<li>
            <input type="checkbox" value="${user.email}">
            ${user.username} (${user.email})
          </li>`;
        });
        html += '</ul><button id="addRecipients">Add to Recipients</button>';
        document.getElementById('userList').innerHTML = html;
        
        document.getElementById('addRecipients').addEventListener('click', () => {
          const recipients = document.getElementById('recipients');
          const selected = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .map(el => el.value);
          
          recipients.value = [
            ...new Set([...recipients.value.split(','), ...selected])
          ].filter(e => e).join(',');
        });
      });

    // Email sending
    document.getElementById('mailForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const response = await fetch('/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      
      const result = await response.text();
      alert(result);
    });
  }
});