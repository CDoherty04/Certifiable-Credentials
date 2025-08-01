const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const CredentialManager = require('./credential-manager');

class CredentialServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.credentialManager = new CredentialManager(process.env.XRPL_NETWORK || 'wss://s.altnet.rippletest.net:51233');

        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, '../public')));
    }

    setupRoutes() {
        // Health check
        this.app.get('/api/health', (req, res) => {
            res.json({ status: 'healthy', timestamp: new Date().toISOString() });
        });

        // Issue a new credential
        this.app.post('/api/credentials/issue', async (req, res) => {
            try {
                const { issuer, subjectAddress, credentialData, credentialType } = req.body;

                if (!issuer || !subjectAddress || !credentialData || !credentialType) {
                    return res.status(400).json({
                        error: 'Missing required fields: issuer, subjectAddress, credentialData, credentialType'
                    });
                }

                const result = await this.credentialManager.issueCredential(
                    issuer,
                    subjectAddress,
                    credentialData,
                    credentialType
                );

                res.json({
                    success: true,
                    data: result
                });
            } catch (error) {
                console.error('Error issuing credential:', error);
                res.status(500).json({
                    error: 'Failed to issue credential',
                    details: error.message
                });
            }
        });

        // Get credential by ID
        this.app.get('/api/credentials/:id', async (req, res) => {
            try {
                const { id } = req.params;

                // For simplicity, we'll return a mock response
                // In a real implementation, you'd query the XRPL for the specific credential
                res.json({
                    success: true,
                    data: {
                        id,
                        status: 'found',
                        message: 'Credential retrieval would query XRPL in production'
                    }
                });
            } catch (error) {
                console.error('Error getting credential:', error);
                res.status(500).json({
                    error: 'Failed to get credential',
                    details: error.message
                });
            }
        });

        // Verify a credential
        this.app.post('/api/credentials/verify', async (req, res) => {
            try {
                const { credential, issuerAddress } = req.body;

                if (!credential || !issuerAddress) {
                    return res.status(400).json({
                        error: 'Missing required fields: credential, issuerAddress'
                    });
                }

                const result = await this.credentialManager.verifyCredential(credential, issuerAddress);

                res.json({
                    success: true,
                    data: result
                });
            } catch (error) {
                console.error('Error verifying credential:', error);
                res.status(500).json({
                    error: 'Failed to verify credential',
                    details: error.message
                });
            }
        });

        // Get credentials for a subject
        this.app.get('/api/credentials/subject/:address', async (req, res) => {
            try {
                const { address } = req.params;

                const credentials = await this.credentialManager.getCredentialsForSubject(address);

                res.json({
                    success: true,
                    data: {
                        subjectAddress: address,
                        credentials,
                        count: credentials.length
                    }
                });
            } catch (error) {
                console.error('Error getting credentials for subject:', error);
                res.status(500).json({
                    error: 'Failed to get credentials for subject',
                    details: error.message
                });
            }
        });

        // Revoke a credential
        this.app.post('/api/credentials/revoke', async (req, res) => {
            try {
                const { credentialId, issuer } = req.body;

                if (!credentialId || !issuer) {
                    return res.status(400).json({
                        error: 'Missing required fields: credentialId, issuer'
                    });
                }

                const result = await this.credentialManager.revokeCredential(credentialId, issuer);

                res.json({
                    success: true,
                    data: result
                });
            } catch (error) {
                console.error('Error revoking credential:', error);
                res.status(500).json({
                    error: 'Failed to revoke credential',
                    details: error.message
                });
            }
        });

        // Generate test wallet
        this.app.post('/api/wallet/generate', async (req, res) => {
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
        });

        // Serve the main page
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        });
    }

    async start() {
        try {
            await this.credentialManager.connect();

            this.app.listen(this.port, () => {
                console.log(`Credential server running on port ${this.port}`);
                console.log(`Visit http://localhost:${this.port} to access the platform`);
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    async stop() {
        await this.credentialManager.disconnect();
        process.exit(0);
    }
}

module.exports = CredentialServer; 