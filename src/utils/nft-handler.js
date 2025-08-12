// TODO: MOVE TO SERVER (xrpl.js only runs on Node.js/Server-side)
const xrpl = require('xrpl');
const net = 'wss://s.devnet.rippletest.net:51233';
const clioNet = 'wss://clio.devnet.rippletest.net:51233/';

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
    const nftId = tx.result.meta.nftoken_id;
    const mintedNFT = await getNFTbyId(nftId);

    // Report results
    console.log('\n=== Transaction result:', tx.result.meta.TransactionResult);
    console.log('\n=== NFT ID:', nftId);
    console.log('\n=== Minted NFT:', JSON.stringify(mintedNFT, null, 2));
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
    const result = await client.request({
      method: "nft_sell_offers",
      nft_id: nftId
    });

    // Match to NFT->offers.destination === subjectAddress
    const sellOffer = result.result.offers.find(offer => offer.destination === subjectAddress);

    console.log('\n=== Sell Offer ID:', sellOffer.nft_offer_index);
    return sellOffer.nft_offer_index;

  } catch (error) {
    console.error("Error creating sell offer:", error);
    console.log('\n=== Error creating sell offer:', error.message); // Use error.message
  } finally {
    if (client && client.isConnected()) { // Check if connected before disconnecting
      await client.disconnect();
    }
  }
}

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
    console.log('\n=== Accepted sell offer tx:', JSON.stringify(tx, null, 2));

    const nft = await getNFTbySellOfferTxAndAddress(tx, wallet.address);
    console.log('\n=== Accepted sell offer nft:', JSON.stringify(nft, null, 2));

    const nftId = nft.nft_id;
    const nftUri = xrpl.convertHexToString(nft.uri);

    console.log('\n=== Accepted sell offer nftId:', nftId);
    console.log('\n=== Accepted sell offer nftUri:', nftUri);

    return { nftId: nftId, uri: nftUri };

  } catch (error) {
    console.error("Error accepting sell offer:", error);
    console.log('\n=== Error accepting sell offer:', error.message); // Use error.message
  } finally {
    if (client && client.isConnected()) { // Check if connected before disconnecting
      await client.disconnect();
    }
  }
}

async function getNFTsByAddress(address) {
  const client = new xrpl.Client(net);

  try {
    await client.connect();

    const response = await client.request({
      method: "account_nfts",
      account: address,
    });

    return response.result.account_nfts;
  } catch (error) {
    console.error("Error getting NFT info:", error);
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
    }
  }
}

async function getNFTbyId(nftId) {
  const client = new xrpl.Client(clioNet);

  try {
    await client.connect();

    const nft = await client.request({
      method: "nft_info",
      nft_id: nftId,
    });

    console.log('getNFTbyId nft:', nft);
    return nft.result;

  } catch (error) {
    console.error("Error getting NFT info:", error);
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
    }
  }
}

async function getNFTbySellOfferTxAndAddress(sellOfferTx, address) {
  const affectedNodes = sellOfferTx.result.meta.AffectedNodes;

  // Loop through affected nodes. There are multiple DeletedNodes, but one of them has FinalFields.Destination which is equal to subjectAddress
  const deletedNodes = affectedNodes.filter(node => node.DeletedNode);
  const finalFields = deletedNodes.map(node => node.DeletedNode.FinalFields).filter(Boolean);

  // Keep the full nodes that have destinations, don't map to just the destination value
  const nodesWithDestination = finalFields.filter(node => node.Destination);
  const myNode = nodesWithDestination.find(node => node.Destination === address);
  const nftId = myNode.NFTokenID;

  const nft = await getNFTbyId(nftId);

  return nft;
}

module.exports = {
  mintNFT,
  createSellOffer,
  acceptSellOffer,
  getNFTsByAddress,
  getNFTbyId
};