const path = require('path');

async function issueCredential(req, res) {
    const { issuerSeed, subjectAddress, subjectEmail, credentialData } = req.body;
    res.json({
        message: "Credential issued successfully!",
        issuerSeed: issuerSeed,
        subjectAddress: subjectAddress,
        subjectEmail: subjectEmail,
        credentialData: credentialData
    });
}

async function receiveCredential(req, res) {
    // TODO: Implement
}

async function verifyCredential(req, res) {
    // TODO: Implement
}

async function getGeneralFrontend(req, res) {
    res.sendFile(path.join(__dirname, '../frontends/General/index.html'));
}
async function getIssuerFrontend(req, res) {
    res.sendFile(path.join(__dirname, '../frontends/Issuer/index.html'));
}
async function getSubjectFrontend(req, res) {
    res.sendFile(path.join(__dirname, '../frontends/Subject/index.html'));
}
async function getAuthorizerFrontend(req, res) {
    res.sendFile(path.join(__dirname, '../frontends/Authorizer/index.html'));
}

module.exports = {
    issueCredential,
    receiveCredential,
    verifyCredential,
    getGeneralFrontend,
    getIssuerFrontend,
    getSubjectFrontend,
    getAuthorizerFrontend
};
