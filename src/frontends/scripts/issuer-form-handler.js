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
            
            if (result.success) {
                // Hide status and show results
                statusDiv.style.display = 'none';
                displayResults(result);
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

function displayResults(result) {
    const resultsDiv = document.getElementById('results');
    const credentialDataLink = document.getElementById('credentialDataLink');
    const nftExplorerLink = document.getElementById('nftExplorerLink');
    const sellOfferId = document.getElementById('sellOfferId');
    
    // Set up the credential data link
    if (result.uri) {
        credentialDataLink.href = result.uri;
        credentialDataLink.style.display = 'inline-block';
    } else {
        credentialDataLink.style.display = 'none';
    }
    
    // Set up the NFT explorer link
    if (result.nftId) {
        nftExplorerLink.href = `https://devnet.xrpl.org/nft/${result.nftId}`;
        nftExplorerLink.style.display = 'inline-block';
    } else {
        nftExplorerLink.style.display = 'none';
    }
    
    // Display the sell offer ID
    if (result.sellOfferId) {
        sellOfferId.value = result.sellOfferId;
    }
    
    // Show the results section
    resultsDiv.style.display = 'block';
}

function copySellOfferId() {
    const sellOfferId = document.getElementById('sellOfferId');
    const copyButton = document.getElementById('copyButton');
    
    if (sellOfferId.value) {
        try {
            // Copy the text
            navigator.clipboard.writeText(sellOfferId.value).then(() => {
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
                textArea.value = sellOfferId.value;
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