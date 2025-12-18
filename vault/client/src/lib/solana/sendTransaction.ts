// import {
//     Rpc,
//     SolanaRpcApi,
//     TransactionInstruction,
//     TransactionSigner,
//     createTransactionMessage,
//     setTransactionMessageFeePayer,
//     setTransactionMessageLifetimeUsingBlockhash,
//     signTransactionMessageWithSigners,
// } from '@solana/kit';

// type SendInstructionsParams = {
//     rpc: Rpc<SolanaRpcApi>;
//     wallet: TransactionSigner; // fee payer
//     instructions: readonly TransactionInstruction[];
//     signers?: readonly TransactionSigner[];
// };

// export async function sendInstructions({
//     rpc,
//     wallet,
//     instructions,
//     signers = [],
// }: SendInstructionsParams) {
//     const { value: latestBlockhash } =
//         await rpc.getLatestBlockhash().send();

//     const tx = createTransactionMessage({ version: 0 })
//     const message = setTransactionMessageLifetimeUsingBlockhash(
//         setTransactionMessageFeePayer(wallet.address, tx
//         ),
//         latestBlockhash
//     );

//     const signed = await signTransactionMessageWithSigners(message, [
//         wallet,
//         ...signers,
//     ]);

//     return sendTx(signed);
// }
