function fetchInfo() {
    fetch('/info')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('infoDisplay');
        tbody.innerHTML = data.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.age}</td>
                <td>${item.city}</td>
                <td>${item.email}</td>
                <td>${item.phone}</td>
                <td>${item.post}</td>
                <td>${new Date(item.start_date).toISOString().split('T')[0]}</td>
                <td>
                    <button class="btn btn-sm btn-warning">N.A</button>
                    <button class="btn btn-sm btn-danger">N.A</button>
                </td>
            </tr>
        `).join('');
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function logout() {
    // Redirect to the login page or perform a logout action
    window.location.href = 'login.html';
}

// Initially load all information
fetchInfo();

// Function to display user's email, needs to be set upon login or page load from session storage or similar
document.getElementById('userEmail').textContent = sessionStorage.getItem('userEmail') || '';
