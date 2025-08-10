async function issueCredential(e) {
    e.preventDefault();

    const statusDiv = document.getElementById('status');
    const submitButton = document.querySelector('button[type="submit"]');

    // Show loading state
    statusDiv.style.display = 'block';
    statusDiv.className = 'status loading';
    statusDiv.textContent = 'Issuing credential...';
    submitButton.disabled = true;

    try {
        // Get form data
        const formData = {
            issuerAddress: document.getElementById('issuerAddress').value,
            subjectAddress: document.getElementById('subjectAddress').value,
            subjectEmail: document.getElementById('subjectEmail').value,
            credentialData: JSON.parse(document.getElementById('credentialData').value)
        };

        // Make POST request
        console.log(JSON.stringify(formData));
        const response = await fetch('http://localhost:3000/issueCredential', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

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
