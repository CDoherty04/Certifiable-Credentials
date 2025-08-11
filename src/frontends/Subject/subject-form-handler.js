async function handleFormSubmission(e) {
    e.preventDefault();

    const { formData, statusDiv, submitButton } = getElements();

    // Show loading state
    statusDiv.style.display = 'block';
    statusDiv.className = 'status loading';
    statusDiv.textContent = 'Receiving credential...';
    submitButton.disabled = true;

    // Call receiveCredential
    try {
        const response = await receiveCredential(formData);
        if (response.ok) {
            const result = await response.json();
            statusDiv.className = 'status success';
            statusDiv.textContent = "Response: " + JSON.stringify(result, null, 2);
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        statusDiv.className = 'status error';
        statusDiv.textContent = `Error: ${error.message}`;
        console.error('Error:', error);
    } finally {
        submitButton.disabled = false;
    }

    return false; // Prevent form submission
}

async function receiveCredential(formData) {
    // Make POST request
    const response = await fetch('http://localhost:3000/api/receiveCredential', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });

    return response;
}

function getElements() {
    // Get form data
    const formData = {
        subjectSeed: document.getElementById('subjectSeed').value,
        sellOfferId: document.getElementById('sellOfferId').value
    };

    // Get other elements
    const statusDiv = document.getElementById('status');
    const submitButton = document.querySelector('button[type="submit"]');

    return { formData, statusDiv, submitButton };
}