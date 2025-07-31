class CredentialPlatform {
    constructor() {
        this.apiBase = '/api';
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupFormHandlers();
        this.setupWalletGeneration();
    }

    setupTabNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Update active button
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active tab
                tabContents.forEach(tab => tab.classList.remove('active'));
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    }

    setupFormHandlers() {
        // Issue credential form
        const issueForm = document.getElementById('issue-form');
        if (issueForm) {
            issueForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleIssueCredential();
            });
        }

        // Subject credentials form
        const subjectForm = document.getElementById('subject-form');
        if (subjectForm) {
            subjectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLoadCredentials();
            });
        }

        // Verify credential form
        const verifyForm = document.getElementById('verify-form');
        if (verifyForm) {
            verifyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleVerifyCredential();
            });
        }
    }

    setupWalletGeneration() {
        const generateBtn = document.getElementById('generate-wallet');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.handleGenerateWallet();
            });
        }
    }

    async handleIssueCredential() {
        try {
            const issuerSeed = document.getElementById('issuer-seed').value;
            const issuerName = document.getElementById('issuer-name').value;
            const subjectAddress = document.getElementById('subject-address').value;
            const credentialType = document.getElementById('credential-type').value;
            const credentialDataText = document.getElementById('credential-data').value;

            if (!issuerSeed || !issuerName || !subjectAddress || !credentialType || !credentialDataText) {
                this.showNotification('Please fill in all fields', 'error');
                return;
            }

            let credentialData;
            try {
                credentialData = JSON.parse(credentialDataText);
            } catch (error) {
                this.showNotification('Invalid JSON in credential data', 'error');
                return;
            }

            // Get issuer address from seed
            const xrpl = await import('https://unpkg.com/xrpl@2.14.0/build/xrpl-latest-min.js');
            const wallet = xrpl.Wallet.fromSeed(issuerSeed);
            
            const issuer = {
                address: wallet.address,
                seed: issuerSeed,
                name: issuerName
            };

            this.showNotification('Issuing credential...', 'info');

            const response = await fetch(`${this.apiBase}/credentials/issue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    issuer,
                    subjectAddress,
                    credentialData,
                    credentialType
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Credential issued successfully!', 'success');
                console.log('Issued credential:', result.data);
                
                // Display the issued credential
                this.displayIssuedCredential(result.data);
            } else {
                this.showNotification(`Failed to issue credential: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Error issuing credential:', error);
            this.showNotification('Error issuing credential: ' + error.message, 'error');
        }
    }

    async handleLoadCredentials() {
        try {
            const address = document.getElementById('my-address').value;
            
            if (!address) {
                this.showNotification('Please enter your XRPL address', 'error');
                return;
            }

            this.showNotification('Loading credentials...', 'info');

            const response = await fetch(`${this.apiBase}/credentials/subject/${address}`);
            const result = await response.json();

            if (result.success) {
                this.displayCredentials(result.data.credentials, address);
                this.showNotification(`Found ${result.data.count} credentials`, 'success');
            } else {
                this.showNotification(`Failed to load credentials: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Error loading credentials:', error);
            this.showNotification('Error loading credentials: ' + error.message, 'error');
        }
    }

    async handleVerifyCredential() {
        try {
            const credentialJson = document.getElementById('credential-json').value;
            const expectedIssuer = document.getElementById('expected-issuer').value;

            if (!credentialJson || !expectedIssuer) {
                this.showNotification('Please fill in all fields', 'error');
                return;
            }

            let credential;
            try {
                credential = JSON.parse(credentialJson);
            } catch (error) {
                this.showNotification('Invalid JSON in credential', 'error');
                return;
            }

            this.showNotification('Verifying credential...', 'info');

            const response = await fetch(`${this.apiBase}/credentials/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    credential,
                    issuerAddress: expectedIssuer
                })
            });

            const result = await response.json();

            if (result.success) {
                this.displayVerificationResult(result.data);
                if (result.data.valid) {
                    this.showNotification('Credential verified successfully!', 'success');
                } else {
                    this.showNotification('Credential verification failed', 'error');
                }
            } else {
                this.showNotification(`Verification failed: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Error verifying credential:', error);
            this.showNotification('Error verifying credential: ' + error.message, 'error');
        }
    }

    async handleGenerateWallet() {
        try {
            this.showNotification('Generating wallet...', 'info');

            const response = await fetch(`${this.apiBase}/wallet/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (result.success) {
                this.displayWalletInfo(result.data);
                this.showNotification('Wallet generated successfully!', 'success');
            } else {
                this.showNotification(`Failed to generate wallet: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Error generating wallet:', error);
            this.showNotification('Error generating wallet: ' + error.message, 'error');
        }
    }

    displayIssuedCredential(credentialData) {
        const tabContent = document.getElementById('issuer-tab');
        
        // Create a display area for the issued credential
        let displayArea = tabContent.querySelector('.issued-credential');
        if (!displayArea) {
            displayArea = document.createElement('div');
            displayArea.className = 'issued-credential';
            displayArea.style.marginTop = '30px';
            displayArea.style.padding = '20px';
            displayArea.style.background = '#f0fff4';
            displayArea.style.border = '1px solid #9ae6b4';
            displayArea.style.borderRadius = '8px';
            tabContent.appendChild(displayArea);
        }

        displayArea.innerHTML = `
            <h3>Issued Credential</h3>
            <p><strong>Credential ID:</strong> ${credentialData.credentialId}</p>
            <p><strong>Transaction Hash:</strong> ${credentialData.transactionHash}</p>
            <p><strong>Status:</strong> ${credentialData.status}</p>
            <details>
                <summary>View Full Credential</summary>
                <pre style="background: white; padding: 10px; border-radius: 4px; overflow-x: auto; margin-top: 10px;">${JSON.stringify(credentialData.credential, null, 2)}</pre>
            </details>
        `;
    }

    displayCredentials(credentials, address) {
        const credentialsList = document.getElementById('credentials-list');
        
        if (credentials.length === 0) {
            credentialsList.innerHTML = `
                <div class="credential-item">
                    <p>No credentials found for address: ${address}</p>
                </div>
            `;
            return;
        }

        credentialsList.innerHTML = credentials.map(credential => `
            <div class="credential-item">
                <h3>${credential.type[1] || 'Credential'}</h3>
                <p><strong>Issuer:</strong> ${credential.issuer.name} (${credential.issuer.id})</p>
                <p><strong>Issued:</strong> ${new Date(credential.issuanceDate).toLocaleDateString()}</p>
                <p><strong>Subject:</strong> ${credential.credentialSubject.id}</p>
                <details>
                    <summary>View Details</summary>
                    <pre style="background: white; padding: 10px; border-radius: 4px; overflow-x: auto; margin-top: 10px;">${JSON.stringify(credential, null, 2)}</pre>
                </details>
            </div>
        `).join('');
    }

    displayVerificationResult(result) {
        const verificationResult = document.getElementById('verification-result');
        
        verificationResult.className = `verification-result ${result.valid ? 'valid' : 'invalid'}`;
        verificationResult.innerHTML = `
            <h3>Verification Result</h3>
            <p><strong>Status:</strong> ${result.valid ? 'Valid' : 'Invalid'}</p>
            <p><strong>Verified At:</strong> ${new Date(result.verifiedAt).toLocaleString()}</p>
            <p><strong>Credential ID:</strong> ${result.credentialId}</p>
            ${result.error ? `<p><strong>Error:</strong> ${result.error}</p>` : ''}
        `;
    }

    displayWalletInfo(walletData) {
        const walletInfo = document.getElementById('wallet-info');
        
        walletInfo.innerHTML = `
            <h3>Generated Wallet</h3>
            <div class="wallet-field">
                <label>Address:</label>
                <div class="input-with-copy">
                    <input type="text" value="${walletData.address}" readonly>
                    <button class="copy-btn" onclick="copyToClipboard('${walletData.address}')" title="Copy Address">
                        📋
                    </button>
                </div>
            </div>
            <div class="wallet-field">
                <label>Seed (Private Key):</label>
                <div class="input-with-copy">
                    <input type="password" id="seed-input" value="${walletData.seed}" readonly>
                    <button class="copy-btn" onclick="copyToClipboard('${walletData.seed}')" title="Copy Seed">
                        📋
                    </button>
                    <button class="toggle-btn" onclick="togglePasswordVisibility('seed-input')" title="Show/Hide Seed">
                        👁️
                    </button>
                </div>
            </div>
            <div class="wallet-field">
                <label>Public Key:</label>
                <div class="input-with-copy">
                    <input type="text" value="${walletData.publicKey}" readonly>
                    <button class="copy-btn" onclick="copyToClipboard('${walletData.publicKey}')" title="Copy Public Key">
                        📋
                    </button>
                </div>
            </div>
            <div class="wallet-field">
                <label>Private Key:</label>
                <div class="input-with-copy">
                    <input type="password" id="private-key-input" value="${walletData.privateKey}" readonly>
                    <button class="copy-btn" onclick="copyToClipboard('${walletData.privateKey}')" title="Copy Private Key">
                        📋
                    </button>
                    <button class="toggle-btn" onclick="togglePasswordVisibility('private-key-input')" title="Show/Hide Private Key">
                        👁️
                    </button>
                </div>
            </div>
            <p style="margin-top: 16px; color: #e53e3e; font-size: 0.9rem;">
                ⚠️ Keep your seed and private key secure! Never share them with anyone.
            </p>
        `;
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }
}

// Helper function to copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show a temporary notification
        const notification = document.getElementById('notification');
        notification.textContent = 'Copied to clipboard!';
        notification.className = 'notification success show';
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const notification = document.getElementById('notification');
        notification.textContent = 'Copied to clipboard!';
        notification.className = 'notification success show';
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    });
}

// Helper function to toggle password visibility
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// Initialize the platform when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CredentialPlatform();
}); 