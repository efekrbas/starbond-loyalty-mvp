import { NextResponse } from "next/server";
import {
  Asset,
  Horizon,
  Keypair,
  Operation,
  TransactionBuilder,
  Networks,
} from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(HORIZON_URL);

export async function POST(request: Request) {
  try {
    const { userAddress } = await request.json();

    if (!userAddress) {
      return NextResponse.json(
        { error: "User address is required" },
        { status: 400 }
      );
    }

    const distributorSecret = process.env.DISTRIBUTOR_SECRET_KEY;
    const issuerPublic = process.env.NEXT_PUBLIC_ISSUER_PUBLIC_KEY;

    if (!distributorSecret || !issuerPublic) {
      return NextResponse.json(
        { error: "Server configuration missing (keys)" },
        { status: 500 }
      );
    }

    const distributorKeypair = Keypair.fromSecret(distributorSecret);
    const asset = new Asset("BOND", issuerPublic);

    // 1. Double check trustline on server side
    const account = await server.loadAccount(userAddress);
    const hasTrustline = account.balances.some((balance: any) => {
      return (
        balance.asset_code === "BOND" && balance.asset_issuer === issuerPublic
      );
    });

    if (!hasTrustline) {
      return NextResponse.json(
        { error: "User does not have a trustline for BOND asset" },
        { status: 400 }
      );
    }

    // 2. Build and submit payment
    const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
    const transaction = new TransactionBuilder(distributorAccount, {
      fee: (await server.fetchBaseFee()).toString(),
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: userAddress,
          asset: asset,
          amount: "10",
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(distributorKeypair);
    const result = await server.submitTransaction(transaction);

    return NextResponse.json({
      success: true,
      hash: result.hash,
    });
  } catch (error: any) {
    console.error("Claim API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process claim" },
      { status: 500 }
    );
  }
}
