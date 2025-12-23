"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useSolana } from "../solana-provider";
import { useWalletAccountTransactionSendingSigner } from "@solana/react";
import { getDepositInstruction } from "@/lib/programs/generated_idl_vault";
import { BN } from "bn.js";
import {
  address,
  appendTransactionMessageInstruction,
  createTransactionMessage,
  getBase58Decoder,
  lamports,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  Signature,
} from "@solana/kit";
import { getUserVaultPdas } from "@/lib/programs/accounts";
import { SYSTEM_PROGRAM_ADDRESS } from "@solana-program/system";
import { UiWalletAccount } from "@wallet-standard/react";
// import { initializeVault } from "@/lib/solana/initialize";

export default function Instructions({
  account,
}: {
  account: UiWalletAccount;
}) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { rpc, chain, isConnected } = useSolana();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const signer = useWalletAccountTransactionSendingSigner(account, chain);

  const isWalletReady = isConnected && account && chain && signer;

  // const handleInitialize = async () => {
  //   if (!wallet.connected || !wallet.publicKey) {
  //     alert("Please connect your wallet first");
  //     return;
  //   }

  //   try {
  //     setIsInitializing(true);
  //     //   await initializeVault(wallet);
  //     alert("Vault initialized successfully!");
  //   } catch (error) {
  //     console.error("Error initializing vault:", error);
  //     alert(
  //       `Failed to initialize vault: ${
  //         error instanceof Error ? error.message : "Unknown error"
  //       }`
  //     );
  //   } finally {
  //     setIsInitializing(false);
  //   }
  // };
  const handleDeposit = async () => {
    if (!isConnected || !signer || !account) return;

    setIsLoading(true);
    try {
      const userPda = await getUserVaultPdas(account.address);
      const { value: latestBlockhash } = await rpc
        .getLatestBlockhash({ commitment: "confirmed" })
        .send();

      const ix = getDepositInstruction({
        amount: 0.1 * 1_000_000_000,
        user: signer,
        userVault: address(userPda.userVault),
        userVaultLamports: address(userPda.userVaultLamports),
        systemProgram: SYSTEM_PROGRAM_ADDRESS,
      });

      console.log("Deposit Ix:", ix);

      const message = pipe(
        createTransactionMessage({ version: 0 }),
        (m) => setTransactionMessageFeePayerSigner(signer, m),
        (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
        (m) => appendTransactionMessageInstruction(ix, m)
      );

      console.log("Message:", message);

      const signature = await signAndSendTransactionMessageWithSigners(message);
      const signatureStr = getBase58Decoder().decode(signature) as Signature;

      // setTxSignature(signatureStr);
      console.log("Signature:", signature);
      console.log("Signature Str:", signatureStr);
    } catch (error) {
      console.error("Deposit failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-5">
        {/* <Button
          className="cursor-pointer"
          onClick={handleInitialize}
          disabled={isInitializing || !wallet.connected}
        >
          {isInitializing ? "Initializing..." : "Initialize Vault"}
        </Button> */}
        <Button onClick={handleDeposit} className="cursor-pointer">
          {" "}
          Deposit SOL{" "}
        </Button>
        <Button className="cursor-pointer"> Withdraw SOL </Button>
        <Button className="cursor-pointer"> Close Vault </Button>
      </div>
    </div>
  );
}
