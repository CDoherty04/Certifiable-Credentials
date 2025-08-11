const path = require('path');
const { StoreCredentialData } = require('../utils/pinata');
const { mintNFT, createSellOffer, acceptSellOffer, getNFTbyId } = require('../utils/nft-handler');
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
        success: true,
        message: 'Credential issued successfully! View credential data at the URI and the ' +
            'NFT at https://devnet.xrpl.org (Search the nftId). Send the Sell Offer ID to the ' +
            'subject for acceptance.',
        uri: URI,
        nftId: nftId,
        sellOfferId: sellOfferId
    });
}

async function receiveCredential(req, res) {
    const { subjectSeed, sellOfferId } = req.body;

    const nft = await acceptSellOffer(subjectSeed, sellOfferId);

    res.json({
        success: true,
        message: 'Credential received successfully! View credential data at the URI and the ' +
            'NFT at https://devnet.xrpl.org (Search the nftId).',
        nftId: nft.NFTokenID,
        uri: xrpl.convertHexToString(nft.URI)
    });
}

async function verifyCredential(req, res) {
    console.log('Verifying credential...');
    const { nftId, authorizedIssuers } = req.body;

    // Get the issuer address from the nftId
    const nft = await getNFTbyId(nftId);

    const isTrusted = authorizedIssuers.includes(nft.issuer);

    if (isTrusted) {
        res.json({
            success: true,
            message: 'The Credential was fetched successfully and issued by an authorized source!',
            nft: nft,
            URI: xrpl.convertHexToString(nft.uri),
            isTrusted: isTrusted
        });
    } else {
        res.json({
            success: false,
            message: 'The Credential was fetched successfully but was issued by an UNAUTHORIZED source.',
            nft: nft,
            URI: xrpl.convertHexToString(nft.uri),
            isTrusted: isTrusted
        });
    }
}

async function getGeneralFrontend(req, res) {
    try {
        const filePath = path.join(__dirname, '../frontends/General/index.html');
        console.log('Serving General frontend from:', filePath);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving General frontend:', error);
        res.status(500).send('Error loading page');
    }
}
async function getIssuerFrontend(req, res) {
    try {
        const filePath = path.join(__dirname, '../frontends/Issuer/index.html');
        console.log('Serving Issuer frontend from:', filePath);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving Issuer frontend:', error);
        res.status(500).send('Error loading page');
    }
}
async function getSubjectFrontend(req, res) {
    try {
        const filePath = path.join(__dirname, '../frontends/Subject/index.html');
        console.log('Serving Subject frontend from:', filePath);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving Subject frontend:', error);
        res.status(500).send('Error loading page');
    }
}
async function getAuthorizerFrontend(req, res) {
    try {
        const filePath = path.join(__dirname, '../frontends/Authorizer/index.html');
        console.log('Serving Authorizer frontend from:', filePath);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving Authorizer frontend:', error);
        res.status(500).send('Error loading page');
    }
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
