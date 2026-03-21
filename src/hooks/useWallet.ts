"use client";

import { useState, useCallback } from "react";
import {
  isConnected,
  requestAccess,
} from "@stellar/freighter-api";
import { useWalletContext } from "@/context/WalletContext";

export const useWallet = () => {
  const { publicKey, setPublicKey } = useWalletContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Attempting to connect to Freighter...");
    try {
      // 1. Check if Freighter is available
      const status = await isConnected();
      console.log("Freighter isConnected status:", status);
      
      const connected = typeof status === "boolean" ? status : status?.isConnected;
      
      if (!connected) {
        throw new Error("Freighter not detected. Please make sure the extension is installed and enabled.");
      }

      // 2. Request access/address
      console.log("Requesting access from Freighter...");
      const result = await requestAccess();
      console.log("Freighter requestAccess result:", result);

      if (result.error) {
        throw new Error(result.error);
      }
      
      if (!result.address) {
        throw new Error("No address returned from Freighter.");
      }

      setPublicKey(result.address);
      console.log("Wallet connected successfully:", result.address);
    } catch (err: any) {
      const msg = err.message || "An error occurred during connection.";
      setError(msg);
      console.error("Detailed Freighter Connection Error:", err);
    } finally {
      setLoading(false);
    }
  }, [setPublicKey]);

  const disconnect = useCallback(() => {
    setPublicKey(null);
  }, [setPublicKey]);

  return {
    publicKey,
    connect,
    disconnect,
    error,
    loading,
    isConnected: !!publicKey,
  };
};
