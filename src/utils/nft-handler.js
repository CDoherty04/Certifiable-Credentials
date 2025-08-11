// TODO: MOVE TO SERVER (xrpl.js only runs on Node.js/Server-side)
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
      URI: xrpl.convertStringToHex(credentialDataURI)
    };

    console.log('Minting NFT...');

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

    const mintedNFT = nfts.result.account_nfts[0].NFTokenID;
    console.log('\n=== Minted NFT:', mintedNFT);
    return mintedNFT;

  } catch (error) {
    console.error("Error minting NFT:", error);
    console.log('\n=== Error minting NFT:', error.message); // Use error.message
  } finally {
    if (client && client.isConnected()) { // Check if connected before disconnecting
      await client.disconnect();
    }
  }
}

async function createSellOffer(issuerSeed, nftId, subjectAddress) {
  const wallet = xrpl.Wallet.fromSeed(issuerSeed);
  const client = new xrpl.Client(net);

  try {
    await client.connect();

    const transactionParams = {
      TransactionType: "NFTokenCreateOffer",
      Account: wallet.address,
      NFTokenID: nftId,
      Destination: subjectAddress,
      Flags: 1,
      Amount: "0"
    };

    console.log('Creating sell offer...');

    // Submit transaction
    const tx = await client.submitAndWait(transactionParams, { wallet });

    // Get Sell Offer
    const sellOffers = await client.request({
      method: "nft_sell_offers",
      nft_id: nftId
    });

    // Report result
    console.log('\n=== Transaction result:', tx.result.meta.TransactionResult);
    console.log('\n=== Sell Offers:', JSON.stringify(sellOffers, null, 2));

    // Get Most Recent Sell Offer ID
    const sellOfferId = sellOffers.result.offers[0].nft_offer_index;
    console.log('\n=== Sell Offer ID:', sellOfferId);
    return sellOfferId;

  } catch (error) {
    console.error("Error creating sell offer:", error);
    console.log('\n=== Error creating sell offer:', error.message); // Use error.message
  } finally {
    if (client && client.isConnected()) { // Check if connected before disconnecting
      await client.disconnect();
    }
  }
}

// TODO: I don't think we need the seed, just the address
async function acceptSellOffer(subjectSeed, nftOfferId) {
  const wallet = xrpl.Wallet.fromSeed(subjectSeed);
  const client = new xrpl.Client(net);

  try {
    await client.connect();

    const transactionParams = {
      TransactionType: "NFTokenAcceptOffer",
      Account: wallet.address,
      NFTokenSellOffer: nftOfferId,
    };

    console.log('Accepting sell offer...');

    // Submit transaction
    const tx = await client.submitAndWait(transactionParams, { wallet });

    // Report result
    console.log('\n=== Transaction result:', tx.result.meta.TransactionResult);

    // Get NFT
    const nfts = await client.request({
      method: "account_nfts",
      account: wallet.address,
    });
    const nft = nfts.result.account_nfts[0];

    return nft;

  } catch (error) {
    console.error("Error accepting sell offer:", error);
    console.log('\n=== Error accepting sell offer:', error.message); // Use error.message
  } finally {
    if (client && client.isConnected()) { // Check if connected before disconnecting
      await client.disconnect();
    }
  }
}

async function getNFTs(subjectAddress) {
  const client = new xrpl.Client(net);

  try {
    await client.connect();

    const nfts = await client.request({
      method: "account_nfts",
      account: subjectAddress,
    });

    return nfts.result.account_nfts;
  } catch (error) {
    console.error("Error getting NFT info:", error);
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
    }
  }
}

module.exports = {
  mintNFT,
  createSellOffer,
  acceptSellOffer,
  getNFTs
};