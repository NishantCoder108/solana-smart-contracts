// // import { sendAndConfirmTransactionFactory } from '@solana/kit';
// // import { rpc, rpcSubscriptions } from './rpc';

// import { getInitializeInstruction } from "../programs/generated_idl_vault";

// // export const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
// //     rpc,
// //     rpcSubscriptions,
// //     // optional: we can add commitment, retries, etc.
// // });


// const ix = getInitializeInstruction({

//     user: wallet.address,
//     vault: vaultPda,
//     systemProgram: SYSTEM_PROGRAM_ADDRESS,
//     args: {
//       amount: 100n,
//     },
//   });
  
//   const latestBlockhash = await rpc.getLatestBlockhash().send();
  
//   const message = setTransactionMessageLifetimeUsingBlockhash(
//     setTransactionMessageFeePayer(
//       createTransactionMessage({
//         instructions: [ix],
//       }),
//       wallet.address
//     ),
//     latestBlockhash
//   );
  
//   const signedTx = await signTransactionMessageWithSigners(message, [wallet]);
  
//   const sendTx = sendAndConfirmTransactionFactory({ rpc });
//   await sendTx(signedTx);
  