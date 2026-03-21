import {
  Asset,
  Horizon,
  TransactionBuilder,
  Operation,
  Networks,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(HORIZON_URL);

/**
 * Checks if a user's wallet has a Trustline for a specific asset.
 */
export const checkTrustline = async (
  userAddress: string,
  assetCode: string,
  issuerAddress: string
): Promise<boolean> => {
  try {
    const account = await server.loadAccount(userAddress);
    return account.balances.some((balance: any) => {
      // @ts-ignore
      return balance.asset_code === assetCode && balance.asset_issuer === issuerAddress;
    });
  } catch (error) {
    console.error("Error checking trustline:", error);
    return false;
  }
};

/**
 * Prompts the user to create a Trustline using Freighter.
 */
export const createTrustline = async (
  userAddress: string,
  assetCode: string,
  issuerAddress: string
): Promise<{ signedTxXdr?: string; error?: string }> => {
  try {
    const account = await server.loadAccount(userAddress);
    const asset = new Asset(assetCode, issuerAddress);

    const transaction = new TransactionBuilder(account, {
      fee: (await server.fetchBaseFee()).toString(),
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset: asset,
        })
      )
      .setTimeout(30)
      .build();

    const { signedTxXdr, error: freighterError } = await signTransaction(transaction.toXDR(), {
      networkPassphrase: Networks.TESTNET,
    });

    if (freighterError) {
      throw new Error(freighterError);
    }

    return { signedTxXdr };
  } catch (error: any) {
    return { error: error.message || "Failed to create trustline." };
  }
};
