document.getElementById('createForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const data = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        city: document.getElementById('city').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        post: document.getElementById('post').value,
        start_date: document.getElementById('start_date').value
    };
    fetch('/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        fetchInfo(); // Refresh the info list after adding
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

document.getElementById('updateForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const id = document.getElementById('updateId').value;
    const data = {
        name: document.getElementById('updateName').value,
        age: document.getElementById('updateAge').value,
        city: document.getElementById('updateCity').value,
        email: document.getElementById('updateEmail').value,
        phone: document.getElementById('updatePhone').value,
        post: document.getElementById('updatePost').value,
        start_date: document.getElementById('updateStartDate').value
    };
    fetch(`/info/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(result => {
        console.log('Success:', result);
        fetchInfo(); // Refresh the info list after updating
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

function fetchInfo() {
    fetch('/info')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('data');
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
                    <button class="btn btn-danger btn-sm" onclick="deleteInfo(${item.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Failed to load data: ' + error.message);
    });
}

function editItem(id) {
    fetch(`/info/${id}`)
    .then(response => response.json())
    .then(item => {
        // Assuming the endpoint returns the item details
        document.getElementById('updateId').value = item.id;
        document.getElementById('updateName').value = item.name;
        document.getElementById('updateAge').value = item.age;
        document.getElementById('updateCity').value = item.city;
        document.getElementById('updateEmail').value = item.email;
        document.getElementById('updatePhone').value = item.phone;
        document.getElementById('updatePost').value = item.post;
        document.getElementById('updateStartDate').value = item.start_date;

        // Show the modal if using Bootstrap, otherwise just make the form visible
        new bootstrap.Modal(document.getElementById('userForm')).show();
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Failed to fetch item: ' + error.message);
    });
}

document.getElementById('updateForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const data = {
        name: document.getElementById('updateName').value || undefined,
        age: document.getElementById('updateAge').value || undefined,
        city: document.getElementById('updateCity').value || undefined,
        email: document.getElementById('updateEmail').value || undefined,
        phone: document.getElementById('updatePhone').value || undefined,
        post: document.getElementById('updatePost').value || undefined,
        start_date: document.getElementById('updateStartDate').value || undefined
    };

    // Convert empty date to null before sending to the server
    if (data.start_date === '') {
        data.start_date = null;
    }

    fetch(`/info/${document.getElementById('updateId').value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log('Success:', result);
        fetchInfo(); // Refresh the info list after updating
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});


function deleteInfo(id) {
    fetch(`/info/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.text())
    .then(result => {
        console.log('Deleted:', result);
        fetchInfo(); // Refresh the info list after deleting
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];  // This will return just the date part, e.g., '2024-02-02'
}

function logout() {
    // Redirect to the login page or perform a logout action
    window.location.href = 'login.html';
}

// Initially load all information
fetchInfo();
