"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useSolana } from "../solana-provider";
import { useWalletAccountTransactionSendingSigner } from "@solana/react";
import {
  fetchUserVault,
  getCloseInstruction,
  getDepositInstruction,
  getInitializeInstruction,
  getWithdrawInstruction,
} from "@/lib/programs/generated_idl_vault";
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
  const [userVaultInfo, setUserVaultInfo] = useState<null | any>({});
  const signer = useWalletAccountTransactionSendingSigner(account, chain);

  const isWalletReady = isConnected && account && chain && signer;

  const handleInitialize = async () => {
    if (!isConnected || !signer || !account) return;

    setIsLoading(true);
    try {
      const userPda = await getUserVaultPdas(account.address);
      const { value: latestBlockhash } = await rpc
        .getLatestBlockhash({ commitment: "confirmed" })
        .send();

      const ix = getInitializeInstruction({
        user: signer,
        userVault: address(userPda.userVault),
        userVaultLamports: address(userPda.userVaultLamports),
        systemProgram: SYSTEM_PROGRAM_ADDRESS,
      });

      console.log("Initialize Ix:", ix);

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
      getAccount();
    } catch (error) {
      console.error("Initialize failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
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
      await getAccount();
    } catch (error) {
      console.error("Deposit failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected || !signer || !account) return;

    setIsLoading(true);
    try {
      const userPda = await getUserVaultPdas(account.address);
      const { value: latestBlockhash } = await rpc
        .getLatestBlockhash({ commitment: "confirmed" })
        .send();

      const ix = getWithdrawInstruction({
        amount: 0.01 * 1_000_000_000,
        user: signer,
        userVault: address(userPda.userVault),
        userVaultLamports: address(userPda.userVaultLamports),
        systemProgram: SYSTEM_PROGRAM_ADDRESS,
      });

      console.log("Withdraw Ix:", ix);

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
      await getAccount();
    } catch (error) {
      console.error("Withdraw failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    if (!isConnected || !signer || !account) return;

    setIsLoading(true);
    try {
      const userPda = await getUserVaultPdas(account.address);
      const { value: latestBlockhash } = await rpc
        .getLatestBlockhash({ commitment: "confirmed" })
        .send();

      const ix = getCloseInstruction({
        user: signer,
        userVault: address(userPda.userVault),
        userVaultLamports: address(userPda.userVaultLamports),
        systemProgram: SYSTEM_PROGRAM_ADDRESS,
      });

      console.log("Close Ix:", ix);

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
      await getAccount();
    } catch (error) {
      console.error("Close failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccount = async () => {
    try {
      const { userVault, userVaultLamports } = await getUserVaultPdas(
        account.address
      );
      const { value: vaultAccountInfo } = await rpc
        .getAccountInfo(address(userVault)) //For fetching particual accounts
        .send();

      console.log({ vaultAccountInfo });
      const decodeData = await fetchUserVault(rpc, address(userVault), {
        commitment: "confirmed",
      });
      const userLampBal = (
        await rpc.getBalance(address(userVaultLamports)).send()
      ).value;
      console.log("User Vault balance:", userLampBal);

      console.log({ decodeData });
      const userVaultBalance = userLampBal;

      setUserVaultInfo({ ...decodeData, userLampBal });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log("fetching account");
    getAccount();
  }, []);
  return (
    <div>
      <div className="flex items-center justify-between gap-5">
        <Button
          className="cursor-pointer"
          onClick={handleInitialize}
          disabled={isInitializing || !isConnected}
        >
          {isInitializing ? "Initializing..." : "Initialize Vault"}
        </Button>
        <Button onClick={handleDeposit} className="cursor-pointer">
          {" "}
          Deposit SOL{" "}
        </Button>
        <Button onClick={handleWithdraw} className="cursor-pointer">
          {" "}
          Withdraw SOL{" "}
        </Button>
        <Button onClick={handleClose} className="cursor-pointer">
          {" "}
          Close Vault{" "}
        </Button>
      </div>

      <div>
        <div className="border rounded-lg p-5">
          <h1 className="text-lg font-semibold">User Vault Info:</h1>

          <div>
            <p> Vault Address: {userVaultInfo?.address} </p>
            <p>Executable: {`${userVaultInfo.executable}`}</p>

            <p>
              Vault's Lamports Address:{" "}
              {`${userVaultInfo?.data?.userVaultLamports}`}
            </p>
            <p>
              Vault Balance:{" "}
              {`${Number(userVaultInfo?.userLampBal) / 1000000000} `}SOL
            </p>
            <p>
              Total Depost SOL :{" "}
              {`${Number(userVaultInfo?.data?.totalDeposit) / 1000000000}`} SOL
            </p>
            <p>Program Address: {`${userVaultInfo?.programAddress}`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
