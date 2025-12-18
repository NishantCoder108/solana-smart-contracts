"use client";
import { rpc } from "@/lib/solana/rpc";
import { address, Lamports } from "@solana/kit";
// import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useSolana } from "../solana-provider";

const WalletBalance = () => {
  const { selectedAccount: account } = useSolana();
  const [balance, setBalance] = useState<Lamports | null>(null);

  const fetchBalance = async () => {
    if (!account?.address) {
      setBalance(null);
      return;
    }

    const acc = account.address.toString();

    try {
      const { value } = await rpc.getBalance(address(acc)).send();
      setBalance(value);
    } catch (error) {
      setBalance(null);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [account?.address]);

  return (
    <div>
      Wallet Balance:{" "}
      {balance !== null ? `${Number(balance) / 1e9} SOL` : "0 SOL"}
    </div>
  );
};

export default WalletBalance;
