"use client";

import { useEffect, useState } from "react";
import { useSolana } from "@/components/solana-provider";
import { useWalletAccountTransactionSendingSigner } from "@solana/react";
import { type UiWalletAccount } from "@wallet-standard/react";
import {
  pipe,
  createTransactionMessage,
  appendTransactionMessageInstruction,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  getBase58Decoder,
  type Signature,
  address,
  fetchEncodedAccount,
} from "@solana/kit";
import {
  fetchAllUserVault,
  fetchUserVault,
  getInitializeInstruction,
  getInitializeInstructionDataDecoder,
} from "@/lib/programs/generated_idl_vault";
import { getUserVaultPdas } from "@/lib/programs/accounts";
import { SYSTEM_PROGRAM_ADDRESS } from "@solana-program/system";
// import { getAddMemoInstruction } from "@solana-program/memo";

// Component that only renders when wallet is connected
function ConnectedMemoCard({ account }: { account: UiWalletAccount }) {
  const { rpc, chain } = useSolana();
  const [isLoading, setIsLoading] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const [userAcc, setUserAcc] = useState({
    userVault: "",
    userVaultLamports: "",
  });
  const signer = useWalletAccountTransactionSendingSigner(account, chain);
  const [userVaultInfo, setUserVaultInfo] = useState<null | any>({});
  const sendMemo = async () => {
    if (!signer) return;

    setIsLoading(true);
    try {
      const userPda = await getUserVaultPdas(account.address);
      const { value: latestBlockhash } = await rpc
        .getLatestBlockhash({ commitment: "confirmed" })
        .send();

      setUserAcc({
        userVault: userPda.userVault,
        userVaultLamports: userPda.userVaultLamports,
      });
      //   const memoInstruction = getAddMemoInstruction({ memo: memoText });
      const iniIx = getInitializeInstruction({
        user: signer,
        userVault: address(userPda.userVault),
        userVaultLamports: address(userPda.userVaultLamports),
        systemProgram: SYSTEM_PROGRAM_ADDRESS,
      });

      console.log("Init Ix:", iniIx);
      const message = pipe(
        createTransactionMessage({ version: 0 }),
        (m) => setTransactionMessageFeePayerSigner(signer, m),
        (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
        (m) => appendTransactionMessageInstruction(iniIx, m)
      );

      console.log("Message:", message);

      const signature = await signAndSendTransactionMessageWithSigners(message);
      const signatureStr = getBase58Decoder().decode(signature) as Signature;

      setTxSignature(signatureStr);
      console.log("Signature:", signature);
      console.log("Signature Str:", signatureStr);

      setMemoText("");
    } catch (error) {
      console.error("Initialization failed:", error);
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

      /**
       * For encoded acconts
       * */
      //   const vaultAccountInfo = await fetchEncodedAccount(
      //     rpc,
      //     address(userVault)
      //   );

      /**
       * Decode data of user Account
       */
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

  console.log({ userVaultInfo });
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-5">
        <h1 className="text-lg font-semibold">User Vault Info:</h1>

        <div>
          <p> Vault Address: {userVaultInfo?.address} </p>
          <p>Executable: {`${userVaultInfo.executable}`}</p>

          <p>
            Vault's Lamports Address:{" "}
            {`${userVaultInfo?.data?.userVaultLamports}`}
          </p>
          <p>Vault Balance: {`${userVaultInfo?.userLampBal}`}</p>
          <p>Total Depost SOL : {`${userVaultInfo?.data?.totalDeposit}`}</p>
          <p>Program Address: {`${userVaultInfo?.programAddress}`}</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Send Memo</h3>
        <label className="block text-sm mb-1">Memo Message</label>
        <textarea
          value={memoText}
          onChange={(e) => setMemoText(e.target.value)}
          placeholder="Enter your memo message"
          className="w-full p-2 border rounded min-h-[100px]"
          maxLength={566}
        />
      </div>

      <button
        // onClick={sendMemo}
        disabled={isLoading || !memoText.trim()}
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isLoading ? "Sending..." : "Initialize Vault"}
      </button>

      {txSignature && (
        <div className="p-2 border rounded text-sm">
          <p className="mb-1">Memo Sent</p>
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View on Solana Explorer →
          </a>
        </div>
      )}
    </div>
  );
}

// Main memo component
export function MemoCard() {
  const { selectedAccount, isConnected } = useSolana();

  return (
    <div className="space-y-4 p-4 ">
      {isConnected && selectedAccount?.address ? (
        <ConnectedMemoCard account={selectedAccount} />
      ) : (
        <p className="text-gray-500 text-center py-4">
          Connect your wallet to send a memo
        </p>
      )}
    </div>
  );
}
