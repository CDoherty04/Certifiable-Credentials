# Certifiable Credentials Platform

A decentralized digital credentials platform built on the XRP Ledger (XRPL) using the XLS-0070 standard. This platform allows educational institutions to issue verifiable credentials, students to receive and store them, and companies to verify their authenticity.

## 🌟 Features

- **Secure Credential Issuance**: Educational institutions can issue tamper-proof digital credentials
- **Student Portal**: Students can receive, view, and manage their credentials
- **Verification System**: Companies can instantly verify credential authenticity
- **Blockchain Storage**: All credentials are stored on the XRPL via NFTs
- **IPFS Integration**: Documents and images are stored on IPFS via Pinata
- **Consumer-Focused Interface**: Clean, responsive design with intuitive user experience

## How To Use

1. **Credential Issuance Flow**:
   - Institution submits credential data via `/school` portal
   - Frontend validates data and sends to backend
   - Backend uploads supporting documents/images to IPFS via Pinata
   - IPFS hosted data stored on XRPL NFT
   - Institution receives Sell Offer ID to send to Student 

2. **Student Management Flow**:
   - Student accesses `/student` portal
   - Enters seed phrase and Sell Offer ID to accept Credential
   - Backend fetches associated credentials from XRPL
   - Displays credential portfolio with verification status

3. **Credential Verification Flow**:
   - Company accesses `/company` portal
   - Enters credential ID and manages trusted issuers list
   - Backend queries XRPL for credential NFT
   - Retrieves IPFS metadata and documents along with NFT
   - Presents verified credential information

### 💰 Setting Up an XRPL Devnet Wallet

Since this platform uses the XRPL for credential storage, you'll need a wallet on the XRPL devnet. Here's a step-by-step guide for users new to XRPL:

The XRPL devnet is a testing environment that mirrors the main XRPL network but uses test tokens that have no real value. It's perfect for development and testing.

1. **Generate a Keypair**
   - Visit [xrpl.org/xrp-testnet-faucet.html](https://xrpl.org/xrp-testnet-faucet.html)
   - Click "Generate" to create a new account
   - Save your **Account Address** and **Secret Key**
   - The faucet will automatically fund your account with 1,000 test XRP

2. **Access Your Wallet**
   - Use the [XRPL Testnet Explorer](https://testnet.xrpl.org) to view your account
   - Enter your account address to see transactions and balance

## 🏗️ Architecture

The platform consists of four main components:

1. **School/University Portal** (`/school`) - Issue credentials to students
2. **Student Portal** (`/student`) - Receive and view credentials
3. **Company Portal** (`/company`) - Verify credential authenticity
4. **General Landing Page** (`/`) - Role selection and platform overview

### System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   Interfaces    │◄──►│   Server        │◄──►│   XRPL          │
│                 │    │                 │    │                 │
│ • School Portal │    │ • Express.js    │    │ • NFT Storage   │
│ • Student Portal│    │ • REST API      │    │ • Credential    │
│ • Company Portal│    │ • File Upload   │    │   Verification  │
│ • Landing Page  │    │ • CORS Support  │    │ • Transaction   │
└─────────────────┘    └─────────────────┘    │   History       │
                                              └─────────────────┘
                                                       ▲
                                                       │
                                              ┌─────────────────┐
                                              │   IPFS Storage  │
                                              │   (Pinata)      │
                                              │                 │
                                              │ • Documents     │
                                              │ • Images        │
                                              │ • Metadata      │
                                              └─────────────────┘
```

## Important Security Notes

⚠️ **Never share your secret key or recovery phrase with anyone!**

⚠️ **Testnet tokens have no real value - only use for development**

⚠️ **Keep your recovery phrase in a safe, offline location**


## 🔗 Useful Links

- [XRPL Documentation](https://xrpl.org/docs/)
- [Pinata Documentation](https://docs.pinata.cloud/)
- [Vercel Documentation](https://vercel.com/docs)

## 💻 Tech Stack

### **Frontend**
- Straight up **HTML/CSS/JS**
- Hosted on **Vercel**

### **Backend**
- **Node.js**
- **Express.js**
- **CORS**
- **Jose**
- **UUID**

### **Blockchain & Decentralized Storage**
- **xrpl.js**
- **UUID**
- **Pinata**

### **Development & Testing**
- **Nodemon**
- **ESLint**
