import {
  Asset,
  Horizon,
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
      return (
        balance.asset_code === assetCode && balance.asset_issuer === issuerAddress
      );
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
  assetCode: string,
  issuerAddress: string
): Promise<{ signedTxXdr?: string; error?: string }> => {
  try {
    // Note: In a real app, you'd build the transaction on the client
    // and send it to Freighter for signing.
    // This is a simplified version using Freighter API's expected flow.
    
    // We'll need the user's address to build the transaction
    // This function assumes the calling code handles the transaction building
    // or we use a higher-level tool.
    
    // For this utility, we'll return instructions or a placeholder for the logic 
    // that uses Operation.changeTrust.
    
    return { error: "Transaction building logic required for client-side signing." };
  } catch (error: any) {
    return { error: error.message || "Failed to create trustline." };
  }
};
