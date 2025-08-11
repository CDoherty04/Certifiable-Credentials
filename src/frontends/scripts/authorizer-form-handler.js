async function handleFormSubmission(e) {
    e.preventDefault();

    const { formData, statusDiv, submitButton } = getElements();

    // Show loading state
    statusDiv.style.display = 'block';
    statusDiv.className = 'status loading';
    statusDiv.textContent = 'Receiving credential...';
    submitButton.disabled = true;

    // Call verifyCredential
    

    return false; // Prevent form submission
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