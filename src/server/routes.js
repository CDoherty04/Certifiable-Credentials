const path = require('path');
const { StoreCredentialData, StoreImage } = require('../utils/pinata');
const { mintNFT, createSellOffer, acceptSellOffer, getNFTbyId } = require('../utils/nft-handler');
const xrpl = require('xrpl');

async function issueCredential(req, res) {
    try {
        console.log('issueCredential called with:', req.body);
        console.log('Files:', req.files);

        // Get the image file from req.files
        if (!req.files || !req.files.image) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const image = req.files.image;
        console.log('Image received:', image.name, image.size, image.mimetype);

        // Get the form data from req.body
        const formDataString = req.body.data;
        if (!formDataString) {
            return res.status(400).json({
                success: false,
                message: 'No form data provided'
            });
        }

        const formData = JSON.parse(formDataString);
        console.log('Form data:', formData);

        // Store the image to get CID
        const imageCID = await StoreImage(image.data);
        console.log('Image CID:', imageCID);

        if (!imageCID) {
            return res.status(500).json({
                success: false,
                message: 'Failed to store image to IPFS'
            });
        }

        const imageURI = `https://ipfs.io/ipfs/${imageCID}`;
        console.log('Image URI:', imageURI);

        // Add the image CID to the form data before uploading to Pinata
        const enhancedFormData = {
            ...formData.credentialData,
            imageURI: imageURI
        };
        console.log('Enhanced form data with image CID:', enhancedFormData);

        // Upload Enhanced Credential Data (including image URI) to Pinata/IPFS
        const credentialDataCID = await StoreCredentialData(enhancedFormData);
        console.log('Credential data CID:', credentialDataCID);

        if (!credentialDataCID) {
            return res.status(500).json({
                success: false,
                message: 'Failed to store credential data to IPFS'
            });
        }

        const credentialDataURI = `https://ipfs.io/ipfs/${credentialDataCID}`;
        console.log('Credential data URI:', credentialDataURI);

        // Create Credential Object
        const nft = await mintNFT(formData.issuerSeed, credentialDataURI);
        const sellOfferId = await createSellOffer(formData.issuerSeed, nft.nft_id, formData.subjectAddress);

        res.json({
            success: true,
            message: 'Credential issued successfully! View credential data at the URI and the ' +
                'NFT at https://devnet.xrpl.org (Search the nftId). Send the Sell Offer ID to the ' +
                'subject for acceptance.',
            uri: credentialDataURI,
            nftId: nft.nft_id,
            sellOfferId: sellOfferId
        });

    } catch (error) {
        console.error('Error in issueCredential:', error);
        res.status(500).json({
            success: false,
            message: 'Error issuing credential',
            error: error.message
        });
    }
}

async function receiveCredential(req, res) {
    const { subjectSeed, sellOfferId } = req.body;

    const { nftId, uri } = await acceptSellOffer(subjectSeed, sellOfferId);

    res.json({
        success: true,
        message: 'Credential received successfully! View credential data at the URI and the ' +
            'NFT at https://devnet.xrpl.org (Search the nftId).',
        nftId: nftId,
        uri: uri
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

async function storeImage(req, res) {
    try {
        console.log('Storing image...');
        
        // Check if image file exists in the request
        if (!req.files || !req.files.image) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const imageFile = req.files.image;
        console.log('Image file received:', imageFile.name, imageFile.size, imageFile.mimetype);

        // Store image to Pinata/IPFS
        const imageCID = await StoreImage(imageFile.data);
        console.log('Image stored with CID:', imageCID);

        if (!imageCID) {
            return res.status(500).json({
                success: false,
                message: 'Failed to store image to IPFS'
            });
        }

        // Return the CID
        res.json({
            success: true,
            message: 'Image stored successfully',
            cid: imageCID,
            ipfsUrl: `https://ipfs.io/ipfs/${imageCID}`
        });

    } catch (error) {
        console.error('Error storing image:', error);
        res.status(500).json({
            success: false,
            message: 'Error storing image',
            error: error.message
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
    storeImage,
    getGeneralFrontend,
    getIssuerFrontend,
    getSubjectFrontend,
    getAuthorizerFrontend
};
