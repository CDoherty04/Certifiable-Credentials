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
        const response = await issueCredential(formData);
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

async function issueCredential(formData) {
    // Make API request
    const response = await fetch('/api/issueCredential', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });

    return response;
}

function getElements() {
    try {
        const credentialDataValue = document.getElementById('credentialData').value;

        const formData = {
            issuerSeed: document.getElementById('issuerSeed').value,
            subjectAddress: document.getElementById('subjectAddress').value,
            subjectEmail: document.getElementById('subjectEmail').value,
            credentialData: JSON.parse(credentialDataValue)
        };

        // Get other elements
        const statusDiv = document.getElementById('status');
        const submitButton = document.querySelector('button[type="submit"]');

        return { formData, statusDiv, submitButton };
    } catch (error) {
        console.error('Error in getElements:', error);
        throw error;
    }
}

function test(e) {
    console.log('=== ISSUER FRONTEND TEST FUNCTION START ===');
    console.log('Test function called');
    console.log('Event object:', e);
    console.log('Event type:', e.type);

    try {
        e.preventDefault();
        console.log('Default prevented', e);

        console.log('About to call getElements()...');
        const { formData, statusDiv, submitButton } = getElements();
        console.log('getElements() completed successfully');
        console.log('Form data:', formData);
        console.log('Status div:', statusDiv);
        console.log('Submit button:', submitButton);
    } catch (error) {
        console.error('Error in test function:', error);
    }

    console.log('=== ISSUER FRONTEND TEST FUNCTION END ===');
    return false;
}