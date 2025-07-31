module.exports = {
    // Server Configuration
    port: process.env.PORT || 3000,
    
    // XRPL Network Configuration
    // Use testnet for development
    xrplNetwork: 'wss://s.altnet.rippletest.net:51233',
    
    // For mainnet (production), use:
    // xrplNetwork: 'wss://xrplcluster.com',
    
    // Environment
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Credential settings
    credentialSettings: {
        // Default credential types
        defaultTypes: [
            'EducationalCredential',
            'ProfessionalCredential', 
            'IdentityCredential',
            'MembershipCredential'
            // TODO: Add a field for custom credential types
        ],
        
        // Credential status options
        statusOptions: [
            'issued',
            'accepted',
            'revoked',
            'suspended',
            'expired'
        ]
    }
}; 