const crypto = require('crypto');

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
    decrypt
}