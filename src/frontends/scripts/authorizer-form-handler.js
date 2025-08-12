const trustedAccounts = []

function addTrustedIssuer() {

    // Get elements
    const { issuerAddress, authorizedIssuersElement, trustedIssuersStatus } = getElements();

    // Validate issuer address Input
    if (!validateIssuerAddress()) {
        trustedIssuersStatus.style.display = 'block';
        trustedIssuersStatus.className = 'status error pulse';
        trustedIssuersStatus.textContent = 'Issuer address is not valid';
        return;
    }

    // Add issuer to trusted accounts
    if (!trustedAccounts.includes(issuerAddress)) {
        trustedAccounts.push(issuerAddress);
        const newIssuerItem = document.createElement('div');
        newIssuerItem.textContent = issuerAddress;
        authorizedIssuersElement.appendChild(newIssuerItem);

        // Update status display with pulse animation
        trustedIssuersStatus.style.display = 'block';
        trustedIssuersStatus.className = 'status success pulse';
        trustedIssuersStatus.textContent = 'Issuer added successfully';

    } else {
        trustedIssuersStatus.style.display = 'block';
        trustedIssuersStatus.className = 'status error pulse';
        trustedIssuersStatus.textContent = 'Issuer already exists';
    }
}

async function verifyCredential() {
    // Get elements
    const { nftId, authorizedIssuers, verifyCredentialStatus, verifyCredentialButton } = getElements();

    // Validate nftId Input
    if (!validateNftId()) {
        verifyCredentialStatus.style.display = 'block';
        verifyCredentialStatus.className = 'status error pulse';
        verifyCredentialStatus.textContent = 'NFT ID is not valid or trusted issuers list is empty';
        return;
    }

    // Show loading state
    verifyCredentialStatus.style.display = 'block';
    verifyCredentialStatus.className = 'status loading';
    verifyCredentialStatus.textContent = 'Verifying credential...';
    verifyCredentialButton.disabled = true;

    // Get the issuer address from the nftId with verifyCredential API call
    let isTrusted = false;
    let errorEncountered = false;

    try {
        const response = await verifyCredentialAPI({ nftId, authorizedIssuers });
        console.log('response', response);
        if (response.ok) {
            const result = await response.json();
            isTrusted = result.isTrusted;
            
            // Display verification results
            displayVerificationResults(result);
            
            // Update status display
            if (isTrusted) {
                verifyCredentialStatus.style.display = 'block';
                verifyCredentialStatus.className = 'status success pulse';
                verifyCredentialStatus.textContent = 'Credential is trusted!';
            } else {
                verifyCredentialStatus.style.display = 'block';
                verifyCredentialStatus.className = 'status error pulse';
                verifyCredentialStatus.textContent = 'Credential is not trusted';
            }
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        verifyCredentialStatus.className = 'status error';
        verifyCredentialStatus.textContent = `Error: ${error.message}`;
        console.error('Error:', error);
        errorEncountered = true;
    } finally {
        verifyCredentialButton.disabled = false;
    }

    // Update status display for errors
    if (errorEncountered) {
        verifyCredentialStatus.style.display = 'block';
        verifyCredentialStatus.className = 'status error pulse';
        verifyCredentialStatus.textContent = 'Error occurred during verification';
    }
}

async function verifyCredentialAPI(formData) {
    // Make API request
    const response = await fetch('/api/verifyCredential', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });

    return response;
}

function displayVerificationResults(result) {
    const credentialImageContainer = document.getElementById('credentialImageContainer');
    const credentialImage = document.getElementById('credentialImage');

    // Display the credential image if available
    if (result.imageURI) {
        credentialImage.src = result.imageURI;
        credentialImage.onload = () => {
            credentialImageContainer.style.display = 'block';
        };
        credentialImage.onerror = () => {
            console.error('Failed to load credential image:', result.imageURI);
            credentialImageContainer.style.display = 'none';
        };
    } else {
        credentialImageContainer.style.display = 'none';
    }
}

function getElements() {
    const issuerAddress = document.getElementById('issuerAddress').value;
    const authorizedIssuersElement = document.getElementById('trustedIssuersList');
    const nftId = document.getElementById('nftId').value;
    const trustedIssuersStatus = document.getElementById('trustedIssuersStatus');
    const verifyCredentialStatus = document.getElementById('verifyCredentialStatus');
    const verifyCredentialButton = document.getElementById('verifyCredentialButton');
    
    // Get primitive list
    const authorizedIssuers = [];
    for (let i = 0; i < authorizedIssuersElement.children.length; i++) {
        authorizedIssuers.push(authorizedIssuersElement.children[i].childNodes[0].data);
    }

    return { issuerAddress, authorizedIssuersElement, authorizedIssuers, nftId, trustedIssuersStatus, verifyCredentialStatus, verifyCredentialButton };
}

function validateIssuerAddress() {
    const { issuerAddress } = getElements();
    return /^r[a-zA-Z0-9]{33}$/.test(issuerAddress);
}

// NFT ID must be valid and trusted issuers list must not be empty
function validateNftId() {
    const { nftId, authorizedIssuers } = getElements();
    return /^[0-9A-Fa-f]{64}$/.test(nftId) && authorizedIssuers.length > 0;
}