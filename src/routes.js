const path = require('path');
const xrpl = require('xrpl');
const net = 'wss://s.devnet.rippletest.net:51233'

const getHomePage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
}

const getCredentialById = async (req, res) => {
    res.json({ note: "Need to implement this", id: req.params.id });
}

const getCredentialsForSubject = async (req, res) => {
    res.json({ note: "Need to implement this", address: req.params.address });
}

const generateWallet = async (req, res) => {
    try {
        const client = new xrpl.Client(net)
        await client.connect()
        let faucetHost = null
        const my_wallet = (await client.fundWallet(null, { faucetHost })).wallet
        const newAccount = [my_wallet.address, my_wallet.seed]
        client.disconnect()
        res.json({
            success: true,
            data: newAccount
        });
    } catch (error) {
        console.error('Error generating wallet:', error);
        res.status(500).json({
            error: 'Failed to generate wallet',
            details: error.message
        });
    }
}

const importWallet = async (req, res) => {
    try {
        const client = new xrpl.Client(net)
        await client.connect()
        const seed = req.params.seed
        const wallet = xrpl.Wallet.fromSeed(seed)
        const address = wallet.address
        client.disconnect()
        res.json({
            success: true,
            data: [address, seed]
        });
    } catch (error) {
        console.error('Error importing wallet:', error);
        res.status(500).json({
            error: 'Failed to import wallet',
            details: error.message
        });
    }
}

const issueCredential = async (req, res) => {
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

        // Convert credential type to hex if it's a string
        const credentialTypeHex = typeof credentialType === 'string'
            ? xrpl.convertStringToHex(credentialType)
            : credentialType;

        // Create metadata for the credential
        const credential = {
            credentialType: credentialType,
            subject: subjectAddress,
            issuer: issuerWallet.address,
            issuedAt: issuedAt,
            uri: uri,
        };
        // Optional Fields 
        if (credentialData) credential.data = credentialData;
        if (expiration) credential.expiration = expiration;

        // Convert uri to hex for NFToken
        const uriHex = xrpl.convertStringToHex(uri);

        // Create NFTokenMint transaction to create the credential on-chain
        const transactionParams = {
            TransactionType: "NFTokenMint",
            Account: issuerWallet.address,
            URI: uriHex,
            Flags: 8, // Burnable NFToken (Add 0x0008 for transferable) (Add 0x0010 for DNFT)
            TransferFee: 0, // No transfer fee
            NFTokenTaxon: 0, // Required, but can be 0
            credential
        };

        // Prepare, sign, and submit the transaction
        const prepared = await client.autofill(transactionParams);
        const signed = issuerWallet.sign(prepared);
        const tx = await client.submitAndWait(signed.tx_blob);

        client.disconnect();

        res.json({
            success: true,
            credential: credential,
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

const verifyCredential = async (req, res) => {
    res.json({ note: "Need to implement this" });
}

const revokeCredential = async (req, res) => {
    res.json({ note: "Need to implement this" });
}

module.exports = {
    getHomePage,
    getCredentialById,
    getCredentialsForSubject,
    generateWallet,
    importWallet,
    issueCredential,
    verifyCredential,
    revokeCredential
}