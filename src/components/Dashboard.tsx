"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Horizon } from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(HORIZON_URL);

interface DashboardProps {
  publicKey: string;
}

const Dashboard: React.FC<DashboardProps> = ({ publicKey }) => {
  const [balances, setBalances] = useState<{ code: string; amount: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBalances = useCallback(async () => {
    try {
      const account = await server.loadAccount(publicKey);
      const formattedBalances = account.balances.map((b: any) => ({
        code: b.asset_type === "native" ? "XLM" : b.asset_code,
        amount: b.balance,
      }));
      setBalances(formattedBalances);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [fetchBalances]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl animate-pulse">
        <div className="h-32 glass rounded-3xl"></div>
        <div className="h-32 glass rounded-3xl"></div>
      </div>
    );
  }

  const xlmaBalance = balances.find((b) => b.code === "XLM")?.amount || "0";
  const bondBalance = balances.find((b) => b.code === "BOND")?.amount || "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      {/* XLM Balance Card */}
      <div className="glass p-6 rounded-3xl flex flex-col space-y-2 border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
        <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Stellar Lumens</span>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold">{parseFloat(xlmaBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="text-sm text-blue-500 font-bold tracking-tighter">XLM</span>
        </div>
      </div>

      {/* BOND Balance Card */}
      <div className="glass p-6 rounded-3xl flex flex-col space-y-2 border border-blue-500/10 bg-gradient-to-br from-blue-500/[0.05] to-transparent">
        <span className="text-blue-500/80 text-xs font-bold uppercase tracking-widest text-shadow-blue">Bond Tokens</span>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-white tracking-tight">{parseFloat(bondBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="text-sm text-blue-400 font-bold tracking-tighter">BOND</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
