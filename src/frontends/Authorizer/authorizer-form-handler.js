const { Wallet } = require('xrpl');

async function handleFormSubmission(e) {
    e.preventDefault();

    const { formData, statusDiv, submitButton } = getElements();

    // Show loading state
    statusDiv.style.display = 'block';
    statusDiv.className = 'status loading';
    statusDiv.textContent = 'Issuing credential...';
    submitButton.disabled = true;

    // Call issueCredential
    try {
        const serverRequestJSON = prepareFormData(formData);
        const response = await issueCredential(serverRequestJSON);
        if (response.ok) {
            const result = await response.json();
            statusDiv.className = 'status success';
            statusDiv.textContent = "Response: " + JSON.stringify(result);
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

async function issueCredential(serverRequestJSON) {
    // Make POST request
    console.log(JSON.stringify(serverRequestJSON));
    const response = await fetch('http://localhost:3000/issueCredential', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(serverRequestJSON)
    });

    return response;
}

function getElements() {
    // Get form data
    const formData = {
        issuerSeed: document.getElementById('issuerSeed').value,
        subjectAddress: document.getElementById('subjectAddress').value,
        subjectEmail: document.getElementById('subjectEmail').value,
        credentialData: JSON.parse(document.getElementById('credentialData').value)
    };

    // Get other elements
    const statusDiv = document.getElementById('status');
    const submitButton = document.querySelector('button[type="submit"]');

    return { formData, statusDiv, submitButton };
}