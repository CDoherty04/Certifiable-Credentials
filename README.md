# XRPL Credentials Platform

A simple platform for managing XRPL credentials using the XLS-0070 standard. This platform supports three main roles: **Issuer**, **Subject**, and **Authorizer**.

## Overview

This platform implements the XRPL Credentials standard (XLS-0070) to provide a decentralized credential management system. It allows:

- **Issuers** to create and issue credentials to subjects
- **Subjects** to receive and manage their credentials
- **Authorizers** to verify and validate credentials

## Features

- Create and issue credentials
- Verify credential authenticity
- Manage credential lifecycle
- Simple REST API interface
- Web-based user interface

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your configuration:
   ```env
   PORT=3000
   XRPL_NETWORK=wss://s.altnet.rippletest.net:51233
   ```
4. Start the application:
   ```bash
   npm start
   ```

## Usage

### API Endpoints

- `POST /api/credentials/issue` - Issue a new credential
- `GET /api/credentials/:id` - Get credential details
- `POST /api/credentials/verify` - Verify a credential
- `GET /api/credentials/subject/:address` - Get credentials for a subject

### Web Interface

Visit `http://localhost:3000` to access the web interface.

## Architecture

The platform consists of:

- **Backend API** - Express.js server handling credential operations
- **XRPL Integration** - Direct interaction with XRPL network
- **Credential Manager** - Core logic for credential operations
- **Web Interface** - Simple HTML/CSS/JS frontend

## Security

- Credentials are cryptographically signed
- All operations are verified on-chain
- Private keys are handled securely
- Network communication is encrypted

## License

MIT License 