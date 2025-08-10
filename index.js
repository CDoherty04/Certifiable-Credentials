const CredentialServer = require('./src/server/server');

async function main() {
    const server = new CredentialServer();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\nShutting down gracefully...');
        await server.stop();
    });
    
    process.on('SIGTERM', async () => {
        console.log('\nShutting down gracefully...');
        await server.stop();
    });
    
    try {
        await server.start();
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

main(); 