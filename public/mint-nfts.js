const xrpl = require('xrpl');
const net = 'wss://s.devnet.rippletest.net:51233';

async function mintNFT(issuerSeed, credentialDataURI) {
  const wallet = xrpl.Wallet.fromSeed(issuerSeed);
  const client = new xrpl.Client(net);

  try {
    await client.connect();
    // Prepare transaction parameters
    const transactionParams = {
      TransactionType: "NFTokenMint",
      Account: wallet.address,
      NFTokenTaxon: 0,
      Flags: 1,
      // TODO: Store on IPFS and use the hash as the URI
      URI: xrpl.convertStringToHex(credentialDataURI) // Currently hardcoded
    };

    console.log('Submitting transaction...');

    // Submit transaction
    const tx = await client.submitAndWait(transactionParams, { wallet });

    // Get minted NFTs
    const nfts = await client.request({
      method: "account_nfts",
      account: wallet.address,
    });

    // Report results
    console.log('\n=== Transaction result:', tx.result.meta.TransactionResult);
    console.log('\n=== NFTs:', JSON.stringify(nfts, null, 2));

  } catch (error) {
    console.error("Error minting NFT:", error);
    console.log('\n=== Error minting NFT:', error.message); // Use error.message
  } finally {
    if (client && client.isConnected()) { // Check if connected before disconnecting
      await client.disconnect();
    }
  }
} 

const issuerSeed = "sEd7hTXg52SdYRLK9Vw5erpi245AU9W";
const credentialDataURI = "https://ipfs.io/ipfs/bafybeigjro2d2tc43bgv7e4sxqg7f5jga7kjizbk7nnmmyhmq35dtz6deq";

(async () => {
  await mintNFT(issuerSeed, credentialDataURI);
})();
