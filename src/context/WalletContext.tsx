"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface WalletContextType {
  publicKey: string | null;
  setPublicKey: (key: string | null) => void;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const isConnected = !!publicKey;

  return (
    <WalletContext.Provider value={{ publicKey, setPublicKey, isConnected }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
};
