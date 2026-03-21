"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { checkTrustline, createTrustline } from "@/utils/stellar";
import Dashboard from "@/components/Dashboard";
import TransactionHistory from "@/components/TransactionHistory";

export default function Home() {
  const { publicKey, isConnected } = useWallet();
  const [claiming, setClaiming] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const handleClaim = async () => {
    if (!publicKey) return;

    setClaiming(true);
    setStatus({ type: "info", message: "Checking trustline..." });

    try {
      const issuerPublic = process.env.NEXT_PUBLIC_ISSUER_PUBLIC_KEY;
      if (!issuerPublic) throw new Error("Issuer public key not configured.");

      // 1. Check Trustline
      const hasTrustline = await checkTrustline(publicKey, "BOND", issuerPublic);

      if (!hasTrustline) {
        setStatus({ type: "info", message: "Trustline missing. Please approve the trustline request..." });
        const { error: trustlineError } = await createTrustline(publicKey, "BOND", issuerPublic);
        
        if (trustlineError) {
          throw new Error(`Trustline failed: ${trustlineError}`);
        }
        
        setStatus({ type: "info", message: "Trustline created! Processing claim..." });
      } else {
        setStatus({ type: "info", message: "Processing claim..." });
      }

      // 2. Call Claim API
      const response = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress: publicKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to claim tokens.");
      }

      setStatus({
        type: "success",
        message: `Successfully claimed 10 BOND! Transaction: ${data.hash.slice(0, 8)}...`,
      });
    } catch (err: any) {
      console.error("Claim Error:", err);
      setStatus({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col space-y-16 animate-in fade-in duration-1000">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            StarBond Loyalty
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Experience the future of loyalty on the Stellar network. Connect your wallet and claim your rewards.
          </p>
        </div>

        {isConnected && publicKey && (
          <div className="w-full flex flex-col items-center space-y-16 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200 fill-mode-both">
            <Dashboard publicKey={publicKey} />
            
            <div className="glass p-8 rounded-3xl w-full max-w-md flex flex-col items-center space-y-6 shadow-2xl shadow-blue-500/10 transition-all hover:border-blue-500/20">
              <div className="flex flex-col items-center space-y-2">
                <span className="text-blue-500 text-xs font-bold uppercase tracking-widest">Available Reward</span>
                <div className="text-4xl font-bold flex items-baseline space-x-2">
                  <span>10.00</span>
                  <span className="text-sm text-gray-500">BOND</span>
                </div>
              </div>

              <button
                onClick={handleClaim}
                disabled={!isConnected || claiming}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95 ${
                  isConnected
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 ring-1 ring-blue-400/50"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                }`}
              >
                {claiming ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </span>
                ) : isConnected ? (
                  "Claim 10 BOND"
                ) : (
                  "Connect Wallet to Claim"
                )}
              </button>

              {status && (
                <div className={`w-full p-4 rounded-xl text-sm border ${
                  status.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" :
                  status.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                  "bg-blue-500/10 border-blue-500/20 text-blue-400"
                }`}>
                  {status.message}
                </div>
              )}
            </div>

            <TransactionHistory publicKey={publicKey} />
          </div>
        )}

        {!isConnected && (
           <div className="glass p-8 rounded-3xl w-full max-w-md flex flex-col items-center space-y-6 shadow-2xl shadow-blue-500/10 transition-all hover:border-blue-500/20 grayscale opacity-50">
           <div className="flex flex-col items-center space-y-2">
             <span className="text-blue-500 text-xs font-bold uppercase tracking-widest">Available Reward</span>
             <div className="text-4xl font-bold flex items-baseline space-x-2">
               <span>10.00</span>
               <span className="text-sm text-gray-500">BOND</span>
             </div>
           </div>
           <button
             disabled
             className="w-full py-4 rounded-2xl font-bold text-lg bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
           >
             Connect Wallet to Claim
           </button>
         </div>
        )}
      </div>
    </main>
  );
}
