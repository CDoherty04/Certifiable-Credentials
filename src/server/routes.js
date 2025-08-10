const path = require('path');
const { StoreCredentialData } = require('../utils/pinata');
const { mintNFT, createSellOffer } = require('../utils/nft-handler');

async function issueCredential(req, res) {
    const { issuerSeed, subjectAddress, subjectEmail, credentialData } = req.body;

    // Upload Credential Data to Pinata/IPFS
    const CID = await StoreCredentialData(credentialData);
    const URI = `https://ipfs.io/ipfs/${CID}`;

    // Create Credential Object
    const nftId = await mintNFT(issuerSeed, URI);
    const sellOfferId = await createSellOffer(issuerSeed, nftId, subjectAddress);

    res.json({
        message: "Credential issued successfully! The credential data can be found on IPFS at the following URI. Send the NFT ID and Sell Offer ID to the subject to receive the credential.",
        URI: URI,
        nftId: nftId,
        sellOfferId: sellOfferId
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
