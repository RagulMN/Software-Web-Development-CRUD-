document.addEventListener('DOMContentLoaded', () => {
    // Select the form element
    const form = document.querySelector('.add-user-form');

    // Listen for the form's submit event
    form.addEventListener('submit', (event) => {
        // Prevent the form from submitting in the traditional way
        event.preventDefault();

        // Create a FormData instance from the form
        const formData = new FormData(form);

        // Convert FormData to JSON
        const user = Object.fromEntries(formData.entries());

        // Send the data to the server
        fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Handle the response from the server
            console.log('User added successfully:', data);
            alert('Registration Success.');
            // Here you can add code to update the UI, e.g., show a success message
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            // Here you can add code to handle errors, e.g., show an error message
        });
    });
});