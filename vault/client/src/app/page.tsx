"use client";
import { useSolana } from "@/components/solana-provider";
import Accounts from "@/components/vault/Accounts";
import Instructions from "@/components/vault/Instructions";
import { MemoCard } from "@/components/vault/memo-card";
import { WalletConnectButton } from "@/components/wallet-connect";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import WalletBalance from "@/components/wallet/WalletBalance";
import Image from "next/image";

export default function Home() {
  const { selectedAccount, isConnected } = useSolana();
  return (
    <div className="flex min-h-screen justify-center py-2.5 bg-zinc-50 font-sans dark:bg-black">
      <main className="">
        <h1 className="text-4xl font-semibold text-center py-4 mb-5">
          Anchor Vault{" "}
        </h1>

        <div className="flex items-center justify-center gap-5">
          <WalletBalance />
          {/* <ConnectWallet /> */}
          <WalletConnectButton />
        </div>

        <div className="my-12">
          <Accounts />
        </div>
        <div className="my-12">
          {isConnected && selectedAccount?.address && (
            <Instructions account={selectedAccount} />
          )}
          <MemoCard />
        </div>
      </main>
    </div>
  );
}
