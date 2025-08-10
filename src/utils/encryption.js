const crypto = require('crypto');
const { Wallet } = require('xrpl');

async function sign(dataHash, walletSeed) {
    const wallet = Wallet.fromSeed("sEd7hTXg52SdYRLK9Vw5erpi245AU9W");
    const signature = wallet.sign(dataHash);
    return signature;
}

async function hash(data) {
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
    return hash;
}

async function encrypt(data) {
    const key = await crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true, // Exportable
        ["encrypt", "decrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(data));
    const ciphertext = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encodedData
    );

    return {
        ciphertext,
        iv,
        key
    };
}

async function decrypt(ciphertext, iv, key) {
    const decoder = new TextDecoder();
    const decryptedData = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        ciphertext
    );
    const decryptedDataString = decoder.decode(decryptedData);
    return JSON.parse(decryptedDataString);
}

module.exports = {
    encrypt,
    decrypt,
    hash,
    sign
}