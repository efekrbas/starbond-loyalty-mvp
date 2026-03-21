const { Keypair } = require("@stellar/stellar-sdk");
const fs = require("fs");
const axios = require("axios");

async function recreate() {
  console.log("Generating new Stellar accounts...");
  
  const issuer = Keypair.random();
  const distributor = Keypair.random();

  console.log("Issuer Public:", issuer.publicKey());
  console.log("Distributor Public:", distributor.publicKey());

  // Fund accounts via Friendbot
  try {
    console.log("Funding Issuer...");
    await axios.get(`https://friendbot.stellar.org?addr=${issuer.publicKey()}`);
    console.log("Funding Distributor...");
    await axios.get(`https://friendbot.stellar.org?addr=${distributor.publicKey()}`);
  } catch (e) {
    console.error("Funding failed, but you can fund them manually at https://laboratory.stellar.org/#account-creator");
  }

  const envContent = `NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_ISSUER_PUBLIC_KEY=${issuer.publicKey()}
ISSUER_SECRET_KEY=${issuer.secret()}
DISTRIBUTOR_SECRET_KEY=${distributor.secret()}
`;

  fs.writeFileSync(".env", envContent);
  console.log("\n--- COPY THESE TO VERCEL ENVIRONMENT VARIABLES ---");
  console.log("NEXT_PUBLIC_STELLAR_NETWORK: testnet");
  console.log("NEXT_PUBLIC_ISSUER_PUBLIC_KEY:", issuer.publicKey());
  console.log("ISSUER_SECRET_KEY:", issuer.secret());
  console.log("DISTRIBUTOR_SECRET_KEY:", distributor.secret());
  console.log("--------------------------------------------------\n");
  
  console.log(".env file has been updated. Now run: node scripts/issueToken.js");
}

recreate();
