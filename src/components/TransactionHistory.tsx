"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Horizon } from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(HORIZON_URL);

interface TransactionHistoryProps {
  publicKey: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ publicKey }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await server
        .transactions()
        .forAccount(publicKey)
        .limit(10)
        .order("desc")
        .call();
      setTransactions(response.records);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  if (loading) {
    return <div className="w-full h-48 glass rounded-3xl animate-pulse flex items-center justify-center text-gray-500">Loading history...</div>;
  }

  return (
    <div className="w-full max-w-4xl space-y-4">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
        <span className="text-gray-500 text-xs uppercase tracking-widest font-mono">Stellar Expert Linked</span>
      </div>

      <div className="glass overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 font-bold text-gray-400">Date</th>
                <th className="px-6 py-4 font-bold text-gray-400">Transaction Hash</th>
                <th className="px-6 py-4 font-bold text-gray-400 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No transactions found</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(tx.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-400 transition-colors flex items-center space-x-1"
                      >
                        <span className="truncate w-32 md:w-64">{tx.hash}</span>
                        <svg className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.66667 1.16667H1.16667V12.8333H12.8333V9.33333M12.8333 1.16667L6.41667 7.58333M12.8333 1.16667V4.66667M12.8333 1.16667H9.33333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
                        </svg>
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tx.successful ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {tx.successful ? "Success" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
