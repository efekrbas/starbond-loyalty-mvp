import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StarBond - Loyalty Platform",
  description: "Next-generation loyalty platform built on Stellar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-background text-foreground antialiased`}>
        <WalletProvider>
          <Navbar />
          <div className="pt-20 flex-1 flex flex-col">
            {children}
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
