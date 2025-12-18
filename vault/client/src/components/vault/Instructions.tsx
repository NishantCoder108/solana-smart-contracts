"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
// import { initializeVault } from "@/lib/solana/initialize";

const Instructions = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInitialize = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsInitializing(true);
      //   await initializeVault(wallet);
      alert("Vault initialized successfully!");
    } catch (error) {
      console.error("Error initializing vault:", error);
      alert(
        `Failed to initialize vault: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-5">
        <Button
          className="cursor-pointer"
          onClick={handleInitialize}
          disabled={isInitializing || !wallet.connected}
        >
          {isInitializing ? "Initializing..." : "Initialize Vault"}
        </Button>
        <Button className="cursor-pointer"> Deposit SOL </Button>
        <Button className="cursor-pointer"> Withdraw SOL </Button>
        <Button className="cursor-pointer"> Close Vault </Button>
      </div>
    </div>
  );
};

export default Instructions;
