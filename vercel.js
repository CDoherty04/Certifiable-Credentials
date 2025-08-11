const CredentialServer = require('./src/server/server');

// Create server instance
const server = new CredentialServer();

// Export the Express app for Vercel
module.exports = server.app; 