// Validação de Login
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.querySelector('#email').value.trim();
      const password = document.querySelector('#password').value.trim();

      if (!email || !password) {
        alert('Please fill in both email and password.');
        return;
      }

      // Aqui você pode fazer a requisição AJAX para o servidor.
      console.log('Login successful!');
      alert('Login successful! (Simulação)');
      loginForm.reset();
    });
  }

  // Validação de Registro
  const registerForm = document.querySelector('.register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = document.querySelector('#username').value.trim();
      const email = document.querySelector('#email').value.trim();
      const password = document.querySelector('#password').value.trim();
      const terms = document.querySelector('#terms').checked;

      if (!username || !email || !password) {
        alert('Please fill in all fields.');
        return;
      }

      if (!terms) {
        alert('You must agree to the terms and conditions.');
        return;
      }

      // Aqui você pode fazer a requisição AJAX para o servidor.
      console.log('Registration successful!');
      alert('Registration successful! (Simulação)');
      registerForm.reset();
    });
  }
});