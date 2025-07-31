const xrpl = require('xrpl');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class CredentialManager {
    constructor(networkUrl) {
        this.networkUrl = networkUrl;
        this.client = null;
    }

    async connect() {
        try {
            this.client = new xrpl.Client(this.networkUrl);
            await this.client.connect();
            console.log('Connected to XRPL network');
        } catch (error) {
            console.error('Failed to connect to XRPL:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.disconnect();
            console.log('Disconnected from XRPL network');
        }
    }

    /**
     * Create a new credential according to XLS-0070 standard
     * @param {Object} issuer - Issuer wallet and information
     * @param {string} subjectAddress - Subject's XRPL address
     * @param {Object} credentialData - The credential data to issue
     * @param {string} credentialType - Type of credential (e.g., "EducationalCredential")
     * @returns {Object} The issued credential
     */
    async issueCredential(issuer, subjectAddress, credentialData, credentialType) {
        try {
            // Generate unique credential ID
            const credentialId = uuidv4();
            
            // Create credential object according to XLS-0070
            const credential = {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://xrpl.org/credentials/v1"
                ],
                "id": `urn:uuid:${credentialId}`,
                "type": ["VerifiableCredential", credentialType],
                "issuer": {
                    "id": issuer.address,
                    "name": issuer.name || "Unknown Issuer"
                },
                "issuanceDate": new Date().toISOString(),
                "credentialSubject": {
                    "id": subjectAddress,
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
            const signedCredential = await this.signCredential(credential, issuer.seed);
            
            // Store on XRPL (using NFToken for credential storage)
            const transactionHash = await this.storeCredentialOnXRPL(signedCredential, issuer);
            
            return {
                credential: signedCredential,
                transactionHash,
                credentialId,
                status: "issued"
            };
        } catch (error) {
            console.error('Error issuing credential:', error);
            throw error;
        }
    }

    /**
     * Sign a credential with the issuer's private key
     */
    async signCredential(credential, issuerSeed) {
        try {
            // Create a hash of the credential data
            const credentialString = JSON.stringify(credential, Object.keys(credential).sort());
            const hash = crypto.createHash('sha256').update(credentialString).digest('hex');
            
            // Sign the hash using XRPL wallet
            const wallet = xrpl.Wallet.fromSeed(issuerSeed);
            const signature = wallet.sign(hash);
            
            // Add proof to credential
            const signedCredential = {
                ...credential,
                "proof": {
                    "type": "Ed25519Signature2020",
                    "created": new Date().toISOString(),
                    "verificationMethod": wallet.address,
                    "proofPurpose": "assertionMethod",
                    "proofValue": signature
                }
            };
            
            return signedCredential;
        } catch (error) {
            console.error('Error signing credential:', error);
            throw error;
        }
    }

    /**
     * Store credential on XRPL using NFToken
     */
    async storeCredentialOnXRPL(credential, issuer) {
        try {
            const wallet = xrpl.Wallet.fromSeed(issuer.seed);
            
            // Create NFToken for credential storage
            const transactionBlob = {
                TransactionType: "NFTokenMint",
                Account: wallet.address,
                URI: xrpl.convertStringToHex(JSON.stringify(credential)),
                Flags: 8, // Transferable
                TransferFee: 0,
                NFTokenTaxon: 0
            };
            
            const prepared = await this.client.autofill(transactionBlob);
            const signed = wallet.sign(prepared);
            const result = await this.client.submitAndWait(signed.tx_blob);
            
            return result.result.hash;
        } catch (error) {
            console.error('Error storing credential on XRPL:', error);
            throw error;
        }
    }

    /**
     * Verify a credential's authenticity
     * @param {Object} credential - The credential to verify
     * @param {string} issuerAddress - Expected issuer address
     * @returns {Object} Verification result
     */
    async verifyCredential(credential, issuerAddress) {
        try {
            // Check if credential has required fields
            if (!credential.proof || !credential.proof.proofValue) {
                return { valid: false, error: "Missing proof" };
            }

            // Verify issuer
            if (credential.issuer.id !== issuerAddress) {
                return { valid: false, error: "Issuer mismatch" };
            }

            // Recreate the hash
            const credentialWithoutProof = { ...credential };
            delete credentialWithoutProof.proof;
            const credentialString = JSON.stringify(credentialWithoutProof, Object.keys(credentialWithoutProof).sort());
            const hash = crypto.createHash('sha256').update(credentialString).digest('hex');

            // Verify signature
            const wallet = xrpl.Wallet.fromSeed(issuerAddress);
            const isValid = wallet.verify(hash, credential.proof.proofValue);

            return {
                valid: isValid,
                verifiedAt: new Date().toISOString(),
                credentialId: credential.id
            };
        } catch (error) {
            console.error('Error verifying credential:', error);
            return { valid: false, error: error.message };
        }
    }

    /**
     * Get credentials for a specific subject
     * @param {string} subjectAddress - Subject's XRPL address
     * @returns {Array} Array of credentials
     */
    async getCredentialsForSubject(subjectAddress) {
        try {
            // Query XRPL for NFTokens owned by the subject
            const response = await this.client.request({
                command: "account_nfts",
                account: subjectAddress
            });

            const credentials = [];
            
            for (const nft of response.result.account_nfts) {
                try {
                    const credentialData = JSON.parse(xrpl.convertHexToString(nft.URI));
                    credentials.push(credentialData);
                } catch (error) {
                    console.warn('Failed to parse NFT as credential:', error);
                }
            }

            return credentials;
        } catch (error) {
            console.error('Error getting credentials for subject:', error);
            throw error;
        }
    }

    /**
     * Revoke a credential
     * @param {string} credentialId - ID of the credential to revoke
     * @param {Object} issuer - Issuer wallet
     * @returns {Object} Revocation result
     */
    async revokeCredential(credentialId, issuer) {
        try {
            // Update credential status to revoked
            const wallet = xrpl.Wallet.fromSeed(issuer.seed);
            
            // This would typically involve updating a status registry
            // For simplicity, we'll just return a success response
            return {
                credentialId,
                revoked: true,
                revokedAt: new Date().toISOString(),
                revokedBy: wallet.address
            };
        } catch (error) {
            console.error('Error revoking credential:', error);
            throw error;
        }
    }
}

module.exports = CredentialManager; 