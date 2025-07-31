const xrpl = require('xrpl');
const CredentialManager = require('../src/credential-manager');

async function runExample() {
    console.log('🚀 XRPL Credentials Platform Example\n');
    
    // Initialize credential manager
    const credentialManager = new CredentialManager('wss://s.altnet.rippletest.net:51233');
    
    try {
        // Connect to XRPL
        await credentialManager.connect();
        console.log('✅ Connected to XRPL testnet\n');
        
        // Generate test wallets
        const issuerWallet = xrpl.Wallet.generate();
        const subjectWallet = xrpl.Wallet.generate();
        
        console.log('📋 Generated test wallets:');
        console.log(`Issuer: ${issuerWallet.address}`);
        console.log(`Subject: ${subjectWallet.address}\n`);
        
        // Create issuer object
        const issuer = {
            address: issuerWallet.address,
            seed: issuerWallet.seed,
            name: "Example University"
        };
        
        // Example credential data
        const credentialData = {
            name: "John Doe",
            degree: "Bachelor of Science in Computer Science",
            institution: "Example University",
            graduationDate: "2023-05-15",
            gpa: "3.8"
        };
        
        console.log('🎓 Creating educational credential...');
        
        try {
            // Try to issue credential on XRPL
            const result = await credentialManager.issueCredential(
                issuer,
                subjectWallet.address,
                credentialData,
                "EducationalCredential"
            );
            
            console.log('✅ Credential issued successfully!');
            console.log(`Credential ID: ${result.credentialId}`);
            console.log(`Transaction Hash: ${result.transactionHash}\n`);
            
            // Verify the credential
            console.log('🔍 Verifying credential...');
            const verificationResult = await credentialManager.verifyCredential(
                result.credential,
                issuerWallet.address
            );
            
            console.log('✅ Verification result:');
            console.log(`Valid: ${verificationResult.valid}`);
            console.log(`Verified at: ${verificationResult.verifiedAt}`);
            if (verificationResult.note) {
                console.log(`Note: ${verificationResult.note}`);
            }
            console.log();
            
            // Get credentials for subject
            console.log('📚 Fetching credentials for subject...');
            const subjectCredentials = await credentialManager.getCredentialsForSubject(subjectWallet.address);
            
            console.log(`Found ${subjectCredentials.length} credentials for subject\n`);
            
            // Display credential details
            if (subjectCredentials.length > 0) {
                const credential = subjectCredentials[0];
                console.log('📄 Credential Details:');
                console.log(`Type: ${credential.type.join(', ')}`);
                console.log(`Issuer: ${credential.issuer.name} (${credential.issuer.id})`);
                console.log(`Issued: ${credential.issuanceDate}`);
                console.log(`Subject: ${credential.credentialSubject.id}`);
                console.log(`Name: ${credential.credentialSubject.name}`);
                console.log(`Degree: ${credential.credentialSubject.degree}`);
                console.log(`Institution: ${credential.credentialSubject.institution}\n`);
            }
            
        } catch (xrplError) {
            if (xrplError.message.includes('Account not found')) {
                console.log('⚠️  Demo Mode: New wallets need funding on testnet');
                console.log('📝 Creating credential locally for demonstration...\n');
                
                // Create credential locally without storing on XRPL
                const credentialId = require('uuid').v4();
                const credential = {
                    "@context": [
                        "https://www.w3.org/2018/credentials/v1",
                        "https://xrpl.org/credentials/v1"
                    ],
                    "id": `urn:uuid:${credentialId}`,
                    "type": ["VerifiableCredential", "EducationalCredential"],
                    "issuer": {
                        "id": issuer.address,
                        "name": issuer.name
                    },
                    "issuanceDate": new Date().toISOString(),
                    "credentialSubject": {
                        "id": subjectWallet.address,
                        ...credentialData
                    },
                    "credentialStatus": {
                        "id": `urn:uuid:${credentialId}#status`,
                        "type": "CredentialStatusList2021",
                        "statusListCredential": `urn:uuid:${credentialId}`,
                        "statusListIndex": "0"
                    }
                };
                
                // Sign the credential
                const signedCredential = await credentialManager.signCredential(credential, issuer.seed);
                
                console.log('✅ Credential created successfully!');
                console.log(`Credential ID: ${credentialId}\n`);
                
                // Verify the credential
                console.log('🔍 Verifying credential...');
                const verificationResult = await credentialManager.verifyCredential(
                    signedCredential,
                    issuer.address
                );
                
                console.log('✅ Verification result:');
                console.log(`Valid: ${verificationResult.valid}`);
                console.log(`Verified at: ${verificationResult.verifiedAt}`);
                if (verificationResult.note) {
                    console.log(`Note: ${verificationResult.note}`);
                }
                console.log();
                
                // Display credential details
                console.log('📄 Credential Details:');
                console.log(`Type: ${signedCredential.type.join(', ')}`);
                console.log(`Issuer: ${signedCredential.issuer.name} (${signedCredential.issuer.id})`);
                console.log(`Issued: ${signedCredential.issuanceDate}`);
                console.log(`Subject: ${signedCredential.credentialSubject.id}`);
                console.log(`Name: ${signedCredential.credentialSubject.name}`);
                console.log(`Degree: ${signedCredential.credentialSubject.degree}`);
                console.log(`Institution: ${signedCredential.credentialSubject.institution}\n`);
                
                console.log('💡 To test full XRPL integration:');
                console.log('1. Fund the issuer wallet with test XRP from a faucet');
                console.log('2. Run this example again\n');
                
            } else {
                throw xrplError;
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        // Disconnect
        await credentialManager.disconnect();
        console.log('👋 Disconnected from XRPL');
    }
}

// Run the example if this file is executed directly
if (require.main === module) {
    runExample();
}

module.exports = { runExample }; 