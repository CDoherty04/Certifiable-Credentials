const trustedAccounts = []

function addTrustedIssuer() {

    // Get elements
    const { issuerAddress, trustedIssuersList, trustedIssuersStatus } = getElements();

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
        trustedIssuersList.appendChild(newIssuerItem);

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

function verifyCredential() {
    // Get elements
    const { nftId, trustedIssuersList, verifyCredentialStatus } = getElements();

    // Validate nftId Input
    // if (!validateNftId()) {
    //     verifyCredentialStatus.style.display = 'block';
    //     verifyCredentialStatus.className = 'status error pulse';
    //     verifyCredentialStatus.textContent = 'NFT ID is not valid';
    //     return;
    // }

    // Get the issuer address from the nftId
    const issuerAddress = "rsoJ2QRSbadhrRkfngiYnHXb9EMpKHJfP9"; // TODO: Get the issuer address from the nftId
    const isTrusted = trustedAccounts.includes(issuerAddress);

    // Update status display
    if (isTrusted) {
        verifyCredentialStatus.style.display = 'block';
        verifyCredentialStatus.className = 'status success pulse';
        verifyCredentialStatus.textContent = 'Credential is trusted';

    } else {
        verifyCredentialStatus.style.display = 'block';
        verifyCredentialStatus.className = 'status error pulse';
        verifyCredentialStatus.textContent = 'Credential is not trusted';
    }
}

function getElements() {
    const issuerAddress = document.getElementById('issuerAddress').value;
    const trustedIssuersList = document.getElementById('trustedIssuersList');
    const nftId = document.getElementById('nftId').value;
    const trustedIssuersStatus = document.getElementById('trustedIssuersStatus');
    const verifyCredentialStatus = document.getElementById('verifyCredentialStatus');

    return { issuerAddress, trustedIssuersList, nftId, trustedIssuersStatus, verifyCredentialStatus };
}

function validateIssuerAddress() {
    const { issuerAddress } = getElements();
    return /^r[a-zA-Z0-9]{33}$/.test(issuerAddress);
}

function validateNftId() {
    const { nftId } = getElements();
    // TODO: Validate nftId
    return /^[a-zA-Z0-9]{35}$/.test(nftId);
}