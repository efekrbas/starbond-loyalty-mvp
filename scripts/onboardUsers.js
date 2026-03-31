const {
  Asset,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  Horizon,
} = require("@stellar/stellar-sdk");
const axios = require("axios");
require("dotenv").config();

async function onboardUsers() {
  const server = new Horizon.Server("https://horizon-testnet.stellar.org");
  const distributorSecret = process.env.DISTRIBUTOR_SECRET_KEY;
  const issuerPublicKey = process.env.NEXT_PUBLIC_ISSUER_PUBLIC_KEY;

  if (!distributorSecret || !issuerPublicKey) {
    console.error("Error: Missing keys in .env");
    process.exit(1);
  }

  const distributorKeypair = Keypair.fromSecret(distributorSecret);
  const bondAsset = new Asset("BOND", issuerPublicKey);

  const users = [
    { name: "Sarah M.", role: "Test User 1" },
    { name: "Michael K.", role: "Test User 2" },
    { name: "David R.", role: "Test User 3" },
    { name: "Jessica L.", role: "Test User 4" },
    { name: "Kevin B.", role: "Test User 5" },
  ];

  console.log("Generating and onboarding 5 verifiable test users...");

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const userKeypair = Keypair.random();
    user.publicKey = userKeypair.publicKey();
    user.secret = userKeypair.secret();

    console.log(`\n[${i + 1}/5] Onboarding ${user.name}...`);
    console.log(`Address: ${user.publicKey}`);

    try {
      // 1. Fund the account via Friendbot
      console.log("  Funding via Friendbot...");
      await axios.get(`https://friendbot.stellar.org?addr=${user.publicKey}`);

      // 2. Wait for account to exist on the ledger
      console.log("  Waiting for account activation...");
      await new Promise((r) => setTimeout(r, 2000));

      const userAccount = await server.loadAccount(user.publicKey);

      // 3. Create Trustline for BOND asset
      console.log(`  Creating Trustline for BOND...`);
      const trustTx = new TransactionBuilder(userAccount, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.changeTrust({
            asset: bondAsset,
          })
        )
        .setTimeout(30)
        .build();

      trustTx.sign(userKeypair);
      await server.submitTransaction(trustTx);
      console.log("  Trustline Success ✅");

      // 4. Send 20 BOND from Distributor to User
      console.log(`  Sending 20 BOND to user...`);
      const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
      const payTx = new TransactionBuilder(distributorAccount, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: user.publicKey,
            asset: bondAsset,
            amount: "20",
          })
        )
        .setTimeout(30)
        .build();

      payTx.sign(distributorKeypair);
      const payResult = await server.submitTransaction(payTx);
      user.txHash = payResult.hash;
      console.log("  Payment Success ✅");
      console.log(`  Tx Hash: ${user.txHash}`);

    } catch (e) {
      console.error(`  Failed to onboard ${user.name}:`, e.message);
      if (e.response && e.response.data) {
        console.error(JSON.stringify(e.response.data.extras.result_codes, null, 2));
      }
    }
  }

  console.log("\n--- USER DATA FOR README ---");
  users.forEach((user) => {
    console.log(`${user.name}: ${user.publicKey}`);
  });
  console.log("----------------------------\n");
}

onboardUsers();
