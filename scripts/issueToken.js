const {
  Asset,
  Keypair,
  Network,
  Operation,
  TransactionBuilder,
  Horizon,
} = require("@stellar/stellar-sdk");
require("dotenv").config();

async function issueToken() {
  const server = new Horizon.Server("https://horizon-testnet.stellar.org");

  // Load secret keys from .env
  const issuerSecret = process.env.ISSUER_SECRET_KEY;
  const distributorSecret = process.env.DISTRIBUTOR_SECRET_KEY;

  if (!issuerSecret || !distributorSecret) {
    console.error("Error: ISSUER_SECRET_KEY and DISTRIBUTOR_SECRET_KEY must be set in .env");
    process.exit(1);
  }

  const issuerKeypair = Keypair.fromSecret(issuerSecret);
  const distributorKeypair = Keypair.fromSecret(distributorSecret);

  console.log("Issuer Public Key:", issuerKeypair.publicKey());
  console.log("Distributor Public Key:", distributorKeypair.publicKey());

  const assetCode = "BOND";
  const amount = "100000";
  const bondAsset = new Asset(assetCode, issuerKeypair.publicKey());

  try {
    // 1. Ensure accounts are funded (optional check, depends on user requirements)
    console.log("Checking account synchronization...");

    // 2. Create Trustline from Distributor to Issuer
    console.log(`Creating trustline for ${assetCode}...`);
    const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
    const trustTx = new TransactionBuilder(distributorAccount, {
      fee: await server.fetchBaseFee(),
      networkPassphrase: Network.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset: bondAsset,
        })
      )
      .setTimeout(30)
      .build();

    trustTx.sign(distributorKeypair);
    await server.submitTransaction(trustTx);
    console.log("Trustline established successfully.");

    // 3. Issue tokens (Transfer from Issuer to Distributor)
    console.log(`Issuing ${amount} ${assetCode} to Distributor...`);
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
    const issueTx = new TransactionBuilder(issuerAccount, {
      fee: await server.fetchBaseFee(),
      networkPassphrase: Network.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: distributorKeypair.publicKey(),
          asset: bondAsset,
          amount: amount,
        })
      )
      .setTimeout(30)
      .build();

    issueTx.sign(issuerKeypair);
    await server.submitTransaction(issueTx);
    console.log(`Successfully issued ${amount} ${assetCode} tokens!`);
  } catch (error) {
    console.error("An error occurred during token issuance:");
    if (error.response && error.response.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

issueToken();
