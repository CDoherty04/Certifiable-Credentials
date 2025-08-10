async function redirectToRole(e) {
    e.preventDefault();

    const { formData, statusDiv, submitButton } = getElements();

    // Show loading state
    statusDiv.style.display = 'block';
    statusDiv.className = 'status loading';
    statusDiv.textContent = 'Redirecting to ' + formData.role + ' page...';
    submitButton.disabled = true;


    // Navigate to the appropriate route instead of fetching HTML
    if (formData.role === 'issuer') {
        window.location.href = '/issuer';
    } else if (formData.role === 'subject') {
        window.location.href = '/receiver';
    } else if (formData.role === 'authorizer') {
        window.location.href = '/authorizer';
    }

    return;
}

function getElements() {
    // Get form data
    const formData = {
        role: document.querySelector('input[name="role"]:checked').value,
    };

    // Get other elements
    const statusDiv = document.getElementById('status');
    const submitButton = document.querySelector('button[type="submit"]');

    return { formData, statusDiv, submitButton };
}