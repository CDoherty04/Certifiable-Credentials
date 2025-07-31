# XRPL Credentials Platform API Documentation

This document describes the API endpoints for the XRPL Credentials Platform, which implements the XLS-0070 standard for verifiable credentials on the XRP Ledger.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication. In production, you should implement proper authentication and authorization mechanisms.

## Endpoints

### Health Check

**GET** `/health`

Check if the server is running and healthy.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Issue Credential

**POST** `/credentials/issue`

Issue a new verifiable credential to a subject.

**Request Body:**
```json
{
  "issuer": {
    "address": "rIssuerAddress...",
    "seed": "sIssuerSeed...",
    "name": "Issuer Name"
  },
  "subjectAddress": "rSubjectAddress...",
  "credentialData": {
    "name": "John Doe",
    "degree": "Bachelor of Science",
    "institution": "University of Example"
  },
  "credentialType": "EducationalCredential"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "credential": {
      "@context": ["https://www.w3.org/2018/credentials/v1", "https://xrpl.org/credentials/v1"],
      "id": "urn:uuid:credential-id",
      "type": ["VerifiableCredential", "EducationalCredential"],
      "issuer": {
        "id": "rIssuerAddress...",
        "name": "Issuer Name"
      },
      "issuanceDate": "2024-01-15T10:30:00.000Z",
      "credentialSubject": {
        "id": "rSubjectAddress...",
        "name": "John Doe",
        "degree": "Bachelor of Science",
        "institution": "University of Example"
      },
      "proof": {
        "type": "Ed25519Signature2020",
        "created": "2024-01-15T10:30:00.000Z",
        "verificationMethod": "rIssuerAddress...",
        "proofPurpose": "assertionMethod",
        "proofValue": "signature..."
      }
    },
    "transactionHash": "txn-hash...",
    "credentialId": "credential-id",
    "status": "issued"
  }
}
```

### Get Credential by ID

**GET** `/credentials/:id`

Retrieve a specific credential by its ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "credential-id",
    "status": "found",
    "message": "Credential retrieval would query XRPL in production"
  }
}
```

### Verify Credential

**POST** `/credentials/verify`

Verify the authenticity of a credential.

**Request Body:**
```json
{
  "credential": {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://xrpl.org/credentials/v1"],
    "id": "urn:uuid:credential-id",
    "type": ["VerifiableCredential", "EducationalCredential"],
    "issuer": {
      "id": "rIssuerAddress...",
      "name": "Issuer Name"
    },
    "issuanceDate": "2024-01-15T10:30:00.000Z",
    "credentialSubject": {
      "id": "rSubjectAddress...",
      "name": "John Doe"
    },
    "proof": {
      "type": "Ed25519Signature2020",
      "created": "2024-01-15T10:30:00.000Z",
      "verificationMethod": "rIssuerAddress...",
      "proofPurpose": "assertionMethod",
      "proofValue": "signature..."
    }
  },
  "issuerAddress": "rIssuerAddress..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "verifiedAt": "2024-01-15T10:30:00.000Z",
    "credentialId": "credential-id"
  }
}
```

### Get Credentials for Subject

**GET** `/credentials/subject/:address`

Retrieve all credentials issued to a specific subject address.

**Response:**
```json
{
  "success": true,
  "data": {
    "subjectAddress": "rSubjectAddress...",
    "credentials": [
      {
        "@context": ["https://www.w3.org/2018/credentials/v1", "https://xrpl.org/credentials/v1"],
        "id": "urn:uuid:credential-id",
        "type": ["VerifiableCredential", "EducationalCredential"],
        "issuer": {
          "id": "rIssuerAddress...",
          "name": "Issuer Name"
        },
        "issuanceDate": "2024-01-15T10:30:00.000Z",
        "credentialSubject": {
          "id": "rSubjectAddress...",
          "name": "John Doe"
        },
        "proof": {
          "type": "Ed25519Signature2020",
          "created": "2024-01-15T10:30:00.000Z",
          "verificationMethod": "rIssuerAddress...",
          "proofPurpose": "assertionMethod",
          "proofValue": "signature..."
        }
      }
    ],
    "count": 1
  }
}
```

### Revoke Credential

**POST** `/credentials/revoke`

Revoke a previously issued credential.

**Request Body:**
```json
{
  "credentialId": "credential-id",
  "issuer": {
    "address": "rIssuerAddress...",
    "seed": "sIssuerSeed...",
    "name": "Issuer Name"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "credentialId": "credential-id",
    "revoked": true,
    "revokedAt": "2024-01-15T10:30:00.000Z",
    "revokedBy": "rIssuerAddress..."
  }
}
```

### Generate Wallet

**POST** `/wallet/generate`

Generate a new XRPL wallet for testing purposes.

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "rWalletAddress...",
    "seed": "sWalletSeed...",
    "publicKey": "public-key...",
    "privateKey": "private-key..."
  }
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

Common HTTP status codes:
- `400` - Bad Request (missing or invalid parameters)
- `500` - Internal Server Error (server-side error)

## XLS-0070 Standard Compliance

This platform implements the XRPL Credentials standard (XLS-0070) which includes:

1. **Credential Structure**: Follows W3C Verifiable Credentials data model
2. **Cryptographic Proofs**: Uses Ed25519 signatures for credential verification
3. **XRPL Integration**: Stores credentials as NFTokens on the XRP Ledger
4. **Credential Status**: Supports credential revocation and status tracking

## Security Considerations

1. **Private Keys**: Never expose private keys or seeds in production
2. **Network Security**: Use HTTPS in production environments
3. **Input Validation**: Always validate and sanitize input data
4. **Rate Limiting**: Implement rate limiting for production use
5. **Authentication**: Add proper authentication and authorization

## Testing

Use the testnet for development and testing:
- Network: `wss://s.altnet.rippletest.net:51233`
- Faucet: Use XRPL testnet faucet to fund test wallets

## Examples

See the `test/example.js` file for a complete example of using the API to issue and verify credentials. 