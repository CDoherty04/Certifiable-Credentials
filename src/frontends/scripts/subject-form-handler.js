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

            if (result.success) {
                // Hide status and show results
                statusDiv.style.display = 'none';
                subjectDisplayResults(result);
            } else {
                // Show error in status
                statusDiv.className = 'status error';
                statusDiv.textContent = `Error: ${result.message || 'Unknown error occurred'}`;
                statusDiv.style.display = 'block';
            }
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        statusDiv.className = 'status error';
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.style.display = 'block';
        console.error('Error:', error);
    } finally {
        submitButton.disabled = false;
    }

    return false; // Prevent form submission
}

function subjectDisplayResults(result) {
    const resultsDiv = document.getElementById('results');
    const subjectCredentialDataLink = document.getElementById('subjectCredentialDataLink');
    const subjectNftExplorerLink = document.getElementById('subjectNftExplorerLink');
    const nftIdDisplay = document.getElementById('nftIdDisplay');

    // Set up the credential data link
    subjectCredentialDataLink.href = result.uri;
    subjectCredentialDataLink.style.display = 'inline-block';

    // Set up the NFT explorer link
    subjectNftExplorerLink.href = `https://devnet.xrpl.org/nft/${result.nftId}`;
    subjectNftExplorerLink.style.display = 'inline-block';

    // Display the NFT ID in the textarea
    nftIdDisplay.value = result.nftId;

    // Show the results section
    resultsDiv.style.display = 'block';
}

function copyNftId() {
    const nftIdDisplay = document.getElementById('nftIdDisplay');
    const copyButton = document.getElementById('copyButton');

    if (nftIdDisplay.value) {
        try {
            // Copy the text
            navigator.clipboard.writeText(nftIdDisplay.value).then(() => {
                // Show success feedback
                const originalText = copyButton.textContent;
                copyButton.textContent = '✅';
                copyButton.className = 'copy-button copied';

                // Reset button after 2 seconds
                setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.className = 'copy-button';
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = nftIdDisplay.value;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                // Show success feedback
                const originalText = copyButton.textContent;
                copyButton.textContent = '✅';
                copyButton.className = 'copy-button copied';

                setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.className = 'copy-button';
                }, 2000);
            });
        } catch (err) {
            // Show error feedback
            copyButton.textContent = '❌';
            copyButton.className = 'copy-button error';

            setTimeout(() => {
                copyButton.textContent = '📋';
                copyButton.className = 'copy-button';
            }, 2000);
        }
    }
}

async function receiveCredential(formData) {
    // Make POST request
    const response = await fetch('/api/receiveCredential', {
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