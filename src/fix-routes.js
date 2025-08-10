async function issueCredential(req, res) {
    const { wallet } = req.body;
    res.json({
        message: "Credential issued successfully!",
        wallet: wallet
    });
}

async function receiveCredential(req, res) {
    // TODO: Implement
}

async function verifyCredential(req, res) {
    // TODO: Implement
}

// Home page handler
function getHomePage(req, res) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
}

module.exports = {
    issueCredential,
    receiveCredential,
    verifyCredential,
    getHomePage
};
