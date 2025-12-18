"use client";
import { getUserVaultPdas } from "@/lib/programs/accounts";
import { Address } from "@solana/kit";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useState } from "react";
import { useSolana } from "../solana-provider";

const Accounts = () => {
  const [userAccounts, setUserAccounts] = useState<string[]>([]);
  //   const wallet = useWallet();
  const { selectedAccount, isConnected } = useSolana();

  const fetchUserAccounts = async () => {
    if (!selectedAccount) return;
    // const [vaultPda, lamportsPda] = await Promise.all([
    //   getUserVaultPdas(wallet.publicKey.toString()),
    //   getUserVaultLamportsPda(wallet.publicKey.toString()),
    // ]);

    const { userVault, userVaultLamports } = await getUserVaultPdas(
      selectedAccount.address
    );
    console.log({ userVault, userVaultLamports });
    setUserAccounts([userVault, userVaultLamports]);
  };

  useEffect(() => {
    fetchUserAccounts();
  }, [selectedAccount?.address]);
  return (
    <div>
      Accounts :{" "}
      {userAccounts.map((i, k) => (
        <p className="text-sm font-semibold" key={k}>
          {" "}
          {i}{" "}
        </p>
      ))}
    </div>
  );
};

export default Accounts;
