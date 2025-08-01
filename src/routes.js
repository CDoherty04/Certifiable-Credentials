const path = require('path');

const getHomePage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
}

const getHealth = (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
}

const generateWallet = async (req, res) => {
    try {
        const xrpl = require('xrpl');
        const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
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

const getCredentialById = async (req, res) => {
    res.json({note: "Need to implement this", id: req.params.id});
}

const getCredentialsForSubject = async (req, res) => {
    res.json({note: "Need to implement this", address: req.params.address});
}

const issueCredential = async (req, res) => {
    res.json({note: "Need to implement this"});
}

const verifyCredential = async (req, res) => {
    res.json({note: "Need to implement this"});
}

const revokeCredential = async (req, res) => {
    res.json({note: "Need to implement this"});
}

module.exports = {
    getHomePage,
    getHealth,
    generateWallet,
    getCredentialById,
    getCredentialsForSubject,
    issueCredential,
    verifyCredential,
    revokeCredential
}