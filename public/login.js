// Assuming your login form has an ID and inputs for email and password
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        // Redirect based on the URL received from the server
        window.location.href = data.url;
    })
    .catch(error => {
        console.error('Login Error:', error);
        alert('Login failed, please try again.');
    });
    // Example function to handle login
function loginUser(email, password) {
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.role === 'admin') {
            window.location.href = '/admin.html'; // Redirect to admin page
        } else {
            window.location.href = '/user.html'; // Redirect to user page
        }
    })
    .catch(error => console.error('Error:', error));
}

});


