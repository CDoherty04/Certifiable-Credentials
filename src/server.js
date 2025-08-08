const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
require('dotenv').config();

class CredentialServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;

        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, '../public')));
    }

    setupRoutes() {

        // Serve the main page
        this.app.get('/', (req, res) => {
            routes.getHomePage(req, res);
        });

        // Get credential by ID
        this.app.get('/api/credentials/:id', async (req, res) => {
            await routes.getCredentialById(req, res);
        });

        // Get credentials for a subject
        this.app.get('/api/credentials/subject/:address', async (req, res) => {
            await routes.getCredentialsForSubject(req, res);
        });

        // Generate wallet
        this.app.post('/api/generate-wallet', async (req, res) => {
            await routes.generateWallet(req, res);
        });

        // Import wallet
        this.app.post('/api/import-wallet/:seed', async (req, res) => {
            await routes.importWallet(req, res);
        });

        // Issue a new credential
        this.app.post('/api/credentials/issue', async (req, res) => {
            await routes.issueCredential(req, res);
        });

        // Verify a credential
        this.app.post('/api/credentials/verify', async (req, res) => {
            await routes.verifyCredential(req, res);
        });

        // Revoke a credential
        this.app.post('/api/credentials/revoke', async (req, res) => {
            await routes.revokeCredential(req, res);
        });
    }

    async start() {
        try {
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
        process.exit(0);
    }
}

module.exports = CredentialServer; 