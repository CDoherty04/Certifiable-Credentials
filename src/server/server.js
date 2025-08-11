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

        // Serve static files from the frontends directory (for shared resources like styles.css)
        // Use absolute paths for better Vercel compatibility
        const staticPath = path.join(__dirname, '../frontends');
        this.app.use('/styles', express.static(path.join(staticPath, 'styles')));
        this.app.use('/scripts', express.static(path.join(staticPath, 'scripts')));
        
        // Add debugging for static file requests
        this.app.use('/styles', (req, res, next) => {
            console.log('Static file request:', req.path);
            next();
        });
        this.app.use('/scripts', (req, res, next) => {
            console.log('Script file request:', req.path);
            next();
        });
        
        // Add a catch-all for debugging
        this.app.use((req, res, next) => {
            console.log(`${req.method} ${req.path}`);
            next();
        });
    }

    setupRoutes() {

        // Serve main pages
        this.app.get('/', (req, res) => {
            routes.getGeneralFrontend(req, res);
        });

        this.app.get('/school', (req, res) => {
            routes.getIssuerFrontend(req, res);
        });

        this.app.get('/student', (req, res) => {
            routes.getSubjectFrontend(req, res);
        });

        this.app.get('/company', (req, res) => {
            routes.getAuthorizerFrontend(req, res);
        });

        // Health check endpoint
        this.app.get('/api/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
            // For Vercel, we don't need to listen on a port
            if (process.env.NODE_ENV !== 'production') {
                this.app.listen(this.port, () => {
                    console.log(`Credential server running on port ${this.port}`);
                    console.log(`Visit http://localhost:${this.port} to access the platform`);
                });
            }
        } catch (error) {
            console.error('Failed to start server:', error);
            if (process.env.NODE_ENV !== 'production') {
                process.exit(1);
            }
        }
    }

    async stop() {
        process.exit(0);
    }
}

module.exports = CredentialServer; 