const { encrypt, decrypt } = require('./utils/encryption');

async function issueCredential(req, res) {
    // 1. Get request
    // Request: issuerAddress, subjectAddress, subjectEmail, credentialData
    const { issuerAddress, subjectAddress, subjectEmail, credentialData } = req.body;
    // 2. Encrypt the credentialData using AES-256-GCM, get iv and issuerSignature
    const { ciphertext, iv, key } = await encrypt(credentialData);
    // 3. Record IssuanceDateTime
    const issuanceDateTime = new Date().toISOString();
    // 4. Submit to Pinata Private storage
    // Pinata: encryptedData, iv, issuerSignature
    const pinataId = "not implemented";
    // 5. Submit to XRPL
    // Submitted to XRPL: addresses, pinataId, issuanceDateTime, id
    const xrplTxHash = "not implemented";
    const mintedNFT = false;
    // 6. Send email to subject (Can implement last)
    const emailSent = false;
    // 7. Return response
    // Response: emailSent, mintedNFT, keyDeliveryMethod, pinataId, xrplTxHash, (error)
    const testing = await decrypt(ciphertext, iv, key);
    res.json({
        emailSent: emailSent,
        mintedNFT: mintedNFT,
        keyDeliveryMethod: "email",
        pinataId: pinataId,
        xrplTxHash: xrplTxHash,
        testing: testing
    });
}

async function receiveCredential(req, res) {
    // TODO: Implement
}

async function verifyCredential(req, res) {
    // TODO: Implement
}

// Home page handler
function getHomePage(req, res) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
}

module.exports = {
    issueCredential,
    receiveCredential,
    verifyCredential,
    getHomePage
};
