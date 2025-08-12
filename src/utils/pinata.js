const { PinataSDK } = require("pinata")
const fs = require('fs');
require("dotenv").config()

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.GATEWAY_URL
})

async function StoreCredentialData(testJson) {
    try {
        const upload = await pinata.upload.public.json(testJson);
        return upload.cid;
    } catch (error) {
        console.log(error)
    }
}

async function StoreImage(filepath) {
    try {
        const file = new File([fs.readFileSync(filepath)], "Testing.txt", { type: "image/jpeg/png/jpg" });
        const upload = await pinata.upload.public.file(file);
        return upload.cid;
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    StoreCredentialData,
    StoreImage
}