
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    loginMessage.textContent = 'Logging in...';

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Login failed.');
        }

        loginMessage.textContent = 'Login successful!';

        window.location.href = '/transactions-page';

    } catch (error) {
        loginMessage.textContent =
            error.message || 'Unable to log in. Please try again.';
    }
});

