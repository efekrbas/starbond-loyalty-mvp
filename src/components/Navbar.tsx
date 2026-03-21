"use client";

import React from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";

const Navbar: React.FC = () => {
  const { publicKey, connect, disconnect, loading, isConnected, error } = useWallet();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            StarBond
          </span>
        </Link>

        {/* Wallet Status Placeholder */}
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    Connected Wallet
                  </span>
                  <span className="text-sm font-mono text-white">
                    {truncateAddress(publicKey!)}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all text-white"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
              >
                {loading ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
          
          {error && (
            <div className="mt-2 text-xs text-red-400 flex flex-col items-end">
              <span>{error}</span>
              {error.includes("not detected") && (
                <a 
                  href="https://www.freighter.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline mt-1"
                >
                  Install Freighter Wallet
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
