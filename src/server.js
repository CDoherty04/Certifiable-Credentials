const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./fix-routes');
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

        // Issuer routes
        this.app.post('/issueCredential', async (req, res) => {
            await routes.issueCredential(req, res);
        });

        // Subject Routes
        this.app.get('/receiveCredential/:credentialId', async (req, res) => {
            await routes.receiveCredential(req, res);
        });

        // Authorizer routes
        this.app.post('/verifyCredential', async (req, res) => {
            await routes.verifyCredential(req, res);
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