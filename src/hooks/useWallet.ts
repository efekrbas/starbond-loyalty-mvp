"use client";

import { useState, useCallback } from "react";
import {
  isConnected,
  getAddress,
} from "@stellar/freighter-api";
import { useWalletContext } from "@/context/WalletContext";

export const useWallet = () => {
  const { publicKey, setPublicKey } = useWalletContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { isConnected: connected } = await isConnected();
      if (!connected) {
        throw new Error("Freighter not found. Please install the Freighter extension.");
      }

      const { address, error: freighterError } = await getAddress();
      if (freighterError) {
        throw new Error(freighterError);
      }
      
      if (!address) {
        throw new Error("Failed to get address.");
      }

      setPublicKey(address);
    } catch (err: any) {
      setError(err.message || "An error occurred during connection.");
      console.error("Freighter Connection Error:", err);
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
