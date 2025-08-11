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
        this.app.use(express.static(path.join(__dirname, '../frontends/General')));
        this.app.use(express.static(path.join(__dirname, '../frontends/Issuer')));
        this.app.use(express.static(path.join(__dirname, '../frontends/Subject')));
        this.app.use(express.static(path.join(__dirname, '../frontends/Authorizer')));
    }

    setupRoutes() {

        // Serve main pages
        this.app.get('/', (req, res) => {
            routes.getGeneralFrontend(req, res);
        });

        this.app.get('/issuer', (req, res) => {
            routes.getIssuerFrontend(req, res);
        });

        this.app.get('/receiver', (req, res) => {
            routes.getSubjectFrontend(req, res);
        });

        this.app.get('/authorizer', (req, res) => {
            routes.getAuthorizerFrontend(req, res);
        });

        // API Routes
        this.app.post('/api/issueCredential', async (req, res) => {
            await routes.issueCredential(req, res);
        });

        this.app.post('/api/receiveCredential', async (req, res) => {
            await routes.receiveCredential(req, res);
        });

        this.app.post('/api/verifyCredential', async (req, res) => {
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