"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";

const Navbar: React.FC = () => {
  const { publicKey, connect, disconnect, loading, isConnected, error } = useWallet();
  const [copied, setCopied] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
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

        {/* Wallet Status */}
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                {/* Wallet Address with Copy */}
                <button
                  onClick={handleCopyAddress}
                  className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group"
                  title="Click to copy full address"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                      Connected Wallet
                    </span>
                    <span className="text-sm font-mono text-white">
                      {truncateAddress(publicKey!)}
                    </span>
                  </div>
                  {/* Copy Icon / Checkmark */}
                  {copied ? (
                    <svg className="w-4 h-4 text-green-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>

                {/* Copied Toast */}
                {copied && (
                  <span className="absolute top-full mt-1 right-0 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-md animate-pulse">
                    Address copied!
                  </span>
                )}

                {/* Disconnect Button - More Visible */}
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-full text-sm font-semibold transition-all text-red-400 hover:text-red-300 flex items-center space-x-2"
                  title="Disconnect Wallet"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Disconnect</span>
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
