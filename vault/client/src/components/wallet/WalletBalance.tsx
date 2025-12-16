"use client";
import { rpc } from "@/lib/solana/rpc";
import { address, Lamports } from "@solana/kit";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

const WalletBalance = () => {
  const wallet = useWallet();
  const [balance, setBalance] = useState<Lamports | null>(null);

  const fetchBalance = async () => {
    if (!wallet?.publicKey) {
      setBalance(null);
      return;
    }

    const acc = address(wallet.publicKey.toString());

    try {
      const { value } = await rpc.getBalance(acc).send();
      setBalance(value);
    } catch (error) {
      setBalance(null);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [wallet.connected]);

  return (
    <div>
      Wallet Balance:{" "}
      {balance !== null ? `${Number(balance) / 1e9} SOL` : "0 SOL"}
    </div>
  );
};

export default WalletBalance;
