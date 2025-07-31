// *******************************************************
// ******************** Send XRP *************************
// *******************************************************
async function sendXRP(sendAmount, destination) {   
  const net = 'wss://s.altnet.rippletest.net:51233';
  const client = new xrpl.Client(net)
  await client.connect()
  console.log("\nConnected. Sending XRP.\n")
  const wallet = xrpl.Wallet.fromSeed(accountSeedField.value)
// -------------------------------------------------------- Prepare transaction
  const prepared_tx = await client.autofill({
    "TransactionType": "Payment",
    "Account": wallet.address,
    "Amount": xrpl.xrpToDrops(sendAmount),
    "Destination": destination
  })
// ------------------------------------------------- Sign prepared instructions
  const signed = wallet.sign(prepared_tx)
// -------------------------------------------------------- Submit signed blob
  const tx = await client.submitAndWait(signed.tx_blob)
  console.log("\nBalance changes: " + JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2))
  console.log(await client.getXrpBalance(wallet.address))
  client.disconnect()    
} // End of sendXRP()