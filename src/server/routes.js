const path = require('path');
const { StoreCredentialData } = require('../utils/pinata');
const { mintNFT, createSellOffer, acceptSellOffer } = require('../utils/nft-handler');
const xrpl = require('xrpl');

async function issueCredential(req, res) {
    const { issuerSeed, subjectAddress, subjectEmail, credentialData } = req.body;

    // Upload Credential Data to Pinata/IPFS
    const CID = await StoreCredentialData(credentialData);
    const URI = `https://ipfs.io/ipfs/${CID}`;

    // Create Credential Object
    const nftId = await mintNFT(issuerSeed, URI);
    const sellOfferId = await createSellOffer(issuerSeed, nftId, subjectAddress);

    res.json({
        message: 'Credential issued successfully! View credential data at the URI and the ' +
            'NFT at https://devnet.xrpl.org (Search the nftId). Send the Sell Offer ID to the ' +
            'subject for acceptance.',
        URI: URI,
        nftId: nftId,
        sellOfferId: sellOfferId
    });
}

async function receiveCredential(req, res) {
    const { subjectSeed, sellOfferId } = req.body;

    console.log(subjectSeed, sellOfferId);

    const nft = await acceptSellOffer(subjectSeed, sellOfferId);
    const URI = xrpl.convertHexToString(nft.URI);

    res.json({
        message: 'Credential received successfully! View credential data at the URI and the ' +
            'NFT at https://devnet.xrpl.org (Search the nftId).',
        nft: nft,
        URI: URI
    });
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
