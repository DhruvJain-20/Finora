
const signupForm = document.getElementById('signup-form');
const signupMessage = document.getElementById('signup-message');

signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    signupMessage.textContent = 'Creating your account...';

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Signup failed.');
        }

        signupMessage.textContent = result.message;

        signupForm.reset();

    } catch (error) {
        signupMessage.textContent =
            error.message || 'Unable to create your account. Please try again.';
    }
});
