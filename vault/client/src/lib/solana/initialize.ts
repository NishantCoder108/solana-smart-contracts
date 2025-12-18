// import {
//     createSolanaRpc,
//     createTransactionMessage,
//     setTransactionMessageFeePayerSigner,
//     setTransactionMessageLifetimeUsingBlockhash,
//     appendTransactionMessageInstruction,
//     signTransactionMessageWithSigners,
//     sendAndConfirmTransactionFactory,
//     address,
//     pipe,
//     TransactionSigner,
//     Address,
//     Transaction,
//     BaseTransactionSignerConfig,
//     SignatureBytes,
// } from "@solana/kit";

// import { WalletContextState } from "@solana/wallet-adapter-react";
// import * as programClient from "../programs/generated_idl_vault";
// import { SYSTEM_PROGRAM_ADDRESS } from "@solana-program/system";
// import { getUserVaultPda, getUserVaultLamportsPda } from "../programs/accounts";
// import { Wallet } from "@coral-xyz/anchor";

  
// export function walletAdapterToSigner(
//   wallet: WalletContextState
// ): TransactionSigner {
//   if (!wallet.publicKey || !wallet.signTransaction) {
//     throw new Error("Wallet not connected or cannot sign");
//   }

// }
