const path = require('path');
const xrpl = require('xrpl');
const { PinataSDK } = require("pinata")
require("dotenv").config()

const net = 'wss://s.devnet.rippletest.net:51233'

async function issueCredential(req, res) {
    try {
        const client = new xrpl.Client(net)
        await client.connect()

        // Extract parameters from request body
        const {
            issuerSeed,        // Issuer's seed (who is issuing the credential)
            subjectAddress,    // Subject's address (who receives the credential)
            credentialType,    // Type of credential (hex encoded)
            uri,               // URI linked to IPFS
            credentialData,    // Optional
            expiration,        // Optional time
        } = req.body;
        const issuedAt = Math.floor(Date.now() / 1000);

        // Validate required parameters
        if (!issuerSeed || !subjectAddress || !credentialType) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['issuerSeed', 'subjectAddress', 'credentialType']
            });
        }

        // Create issuer wallet
        const issuerWallet = xrpl.Wallet.fromSeed(issuerSeed);

        // Create metadata for the credential
        const credential = {
            credentialType: credentialType,
            subject: subjectAddress,
            issuer: issuerWallet.address,
            issuedAt: issuedAt,
        };
        // Optional Fields 
        if (credentialData) credential.data = credentialData;
        if (expiration) credential.expiration = expiration;

        // Convert credential to hex for NFToken
        const credentialHex = xrpl.convertStringToHex(JSON.stringify(credential));

        // Create NFTokenMint transaction to create the credential on-chain
        const transactionParams = {
            TransactionType: "NFTokenMint",
            Account: issuerWallet.address,
            URI: credentialHex,
            Flags: 8, // Burnable NFToken (Add 0x0008 for transferable) (Add 0x0010 for DNFT)
            TransferFee: 0, // No transfer fee
            NFTokenTaxon: 0, // Required, but can be 0
        };

        // Prepare, sign, and submit the transaction
        const prepared = await client.autofill(transactionParams);
        const signed = issuerWallet.sign(prepared);
        const tx = await client.submitAndWait(signed.tx_blob);

        client.disconnect();

        res.json({
            success: true,
            credentialUri: credentialHex,
            issuer: issuerWallet.address,
            subject: subjectAddress,
            transactionHash: tx.result.hash,
            note: "Credential created as NFToken on XRPL blockchain"
        });

    } catch (error) {
        console.error('Error issuing credential:', error);
        res.status(500).json({
            error: 'Failed to issue credential',
            details: error.message
        });
    }
}

async function receiveCredential(req, res) {
    
}

async function requestCredential(req, res) {
    
}

// Home page handler
function getHomePage(req, res) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
}

module.exports = {
    issueCredential,
    receiveCredential,
    requestCredential,
    getHomePage
};
