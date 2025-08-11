async function redirectToRole(e) {
    e.preventDefault();

    const { formData, statusDiv, submitButton } = getElements();

    // Show loading state
    statusDiv.style.display = 'block';
    statusDiv.className = 'status loading';
    statusDiv.textContent = 'Redirecting to ' + formData.role + ' page...';
    submitButton.disabled = true;

    // Navigate to the appropriate route
    if (formData.role === 'school') {
        window.location.href = '/school';
    } else if (formData.role === 'student') {
        window.location.href = '/student';
    } else if (formData.role === 'company') {
        window.location.href = '/company';
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