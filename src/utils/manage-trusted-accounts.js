function authorizeIssuer(trustedAddresses, issuerAddress) {
    trustedAddresses.push(issuerAddress);
    return trustedAddresses;
}

function revokeIssuer(trustedAddresses, issuerAddress) {
    trustedAddresses = trustedAddresses.filter(address => address !== issuerAddress);
    return trustedAddresses;
}

function isIssuerAuthorized(trustedAddresses, issuerAddress) {
    return trustedAddresses.includes(issuerAddress);
}

module.exports = {
    authorizeIssuer,
    revokeIssuer,
    isIssuerAuthorized
};