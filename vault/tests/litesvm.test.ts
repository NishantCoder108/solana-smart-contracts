import { FailedTransactionMetadata, LiteSVM } from "litesvm";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import anchor from "@coral-xyz/anchor";
import Idl from "../target/idl/vault.json" with {type: "json"};
import { assert } from "chai";


describe("LiteSVM: Anchor Vault", () => {
    const svm = new LiteSVM()
    const programId = new PublicKey(Idl.address);
    const coder = new anchor.BorshCoder(Idl as anchor.Idl);

    const payer = Keypair.generate();
    svm.airdrop(payer.publicKey, BigInt(10 * LAMPORTS_PER_SOL));

    const programPath = new URL("../target/deploy/vault.so", import.meta.url).pathname;
    svm.addProgramFromFile(programId, programPath);

    const [userVault] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), payer.publicKey.toBuffer()], programId
    );
    const [userVaultLamports] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_lamports"), payer.publicKey.toBuffer(), userVault.toBuffer()], programId
    );



    /// Initialize 
    it("Initialize User Vault account", () => {
        /**
         *** Method : Initialize
         * Create instruction
         * and then create transaction 
         * and send transaction on onchain
         */
        const data = coder.instruction.encode("initialize", {});

        const ix = new TransactionInstruction({
            keys: [
                { pubkey: payer.publicKey, isSigner: true, isWritable: true },
                { pubkey: userVault, isSigner: false, isWritable: true },
                { pubkey: userVaultLamports, isSigner: false, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            programId,
            data
        });
        const tx = new Transaction().add(ix);
        tx.feePayer = payer.publicKey;
        tx.recentBlockhash = svm.latestBlockhash();
        tx.sign(payer);
        const res = svm.sendTransaction(tx);
        // console.log(res.toString());

        const userVaultInfo = svm.getAccount(userVault);
        const userVaultAccount = coder.accounts.decode("UserVault", Buffer.from(userVaultInfo.data));

        // console.log({ userVaultInfo });
        // console.log({ userVaultAccount });

        assert.equal(userVaultAccount.total_deposit, 0);
        assert.equal(userVaultAccount.user_vault_lamports.toBase58(), userVaultLamports.toBase58());
    })

    /// Deposit 
    it("Deposit Lamports to Vault account", () => {
        const ixArgs = {
            amount: new anchor.BN(2 * LAMPORTS_PER_SOL)
        }
        const data = coder.instruction.encode("deposit", ixArgs);

        const ix = new TransactionInstruction({
            keys: [
                { pubkey: payer.publicKey, isSigner: true, isWritable: true },
                { pubkey: userVault, isSigner: false, isWritable: true },
                { pubkey: userVaultLamports, isSigner: false, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            programId,
            data
        });
        const tx = new Transaction().add(ix);
        tx.feePayer = payer.publicKey;
        tx.recentBlockhash = svm.latestBlockhash();
        tx.sign(payer);

        const res = svm.sendTransaction(tx);
        // console.log(res.toString());

        const userVaultInfo = svm.getAccount(userVault);
        const userVaultAccount = coder.accounts.decode("UserVault", Buffer.from(userVaultInfo.data));

        // console.log({ userVaultInfo });
        // console.log({ userVaultAccount });

        const userLampAccount = svm.getBalance(userVaultLamports);
        // console.log({ userLampAccount });

        assert.equal(userVaultAccount.total_deposit, 2 * LAMPORTS_PER_SOL);
        assert.equal(userVaultAccount.user_vault_lamports.toBase58(), userVaultLamports.toBase58());
        assert.equal(Number(userLampAccount), 2 * LAMPORTS_PER_SOL);
    })

    /// Withdraw
    it("Withdraw Lamports to Wallet account", () => {
        const ixArgs = {
            amount: new anchor.BN(LAMPORTS_PER_SOL)
        }
        const data = coder.instruction.encode("withdraw", ixArgs);

        const ix = new TransactionInstruction({
            keys: [
                { pubkey: payer.publicKey, isSigner: true, isWritable: true },
                { pubkey: userVault, isSigner: false, isWritable: true },
                { pubkey: userVaultLamports, isSigner: false, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            programId,
            data
        });
        const tx = new Transaction().add(ix);
        tx.feePayer = payer.publicKey;
        tx.recentBlockhash = svm.latestBlockhash();
        tx.sign(payer);

        const res = svm.sendTransaction(tx);
        // console.log(res.toString());

        const userVaultInfo = svm.getAccount(userVault);
        const userVaultAccount = coder.accounts.decode("UserVault", Buffer.from(userVaultInfo.data));

        // console.log({ userVaultInfo });
        // console.log({ userVaultAccount });

        const userLampAccount = svm.getBalance(userVaultLamports);
        // console.log({ userLampAccount });

        assert.equal(userVaultAccount.total_deposit, 2 * LAMPORTS_PER_SOL);
        assert.equal(userVaultAccount.user_vault_lamports.toBase58(), userVaultLamports.toBase58());
        assert.equal(Number(userLampAccount), LAMPORTS_PER_SOL);
    })

    /// Reject invalid deposit amounts
    it("Rejects zero lamport deposit", () => {
        const data = coder.instruction.encode("deposit", { amount: new anchor.BN(0) });
        const ix = new TransactionInstruction({
            keys: [
                { pubkey: payer.publicKey, isSigner: true, isWritable: true },
                { pubkey: userVault, isSigner: false, isWritable: true },
                { pubkey: userVaultLamports, isSigner: false, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            programId,
            data
        });
        const tx = new Transaction().add(ix);
        tx.feePayer = payer.publicKey;
        tx.recentBlockhash = svm.latestBlockhash();
        tx.sign(payer);

        const res = svm.sendTransaction(tx);
        // console.log(res.toString())
        expectCustomError(res, 6004);
    })

    /// Reject withdrawals that exceed vault balance
    it("Rejects withdrawing more than available lamports", () => {
        const data = coder.instruction.encode("withdraw", { amount: new anchor.BN(2 * LAMPORTS_PER_SOL) });
        const ix = new TransactionInstruction({
            keys: [
                { pubkey: payer.publicKey, isSigner: true, isWritable: true },
                { pubkey: userVault, isSigner: false, isWritable: true },
                { pubkey: userVaultLamports, isSigner: false, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            programId,
            data
        });
        const tx = new Transaction().add(ix);
        tx.feePayer = payer.publicKey;
        tx.recentBlockhash = svm.latestBlockhash();
        tx.sign(payer);

        const res = svm.sendTransaction(tx);
        expectCustomError(res, 6005);
    })

    /// Close
    it("Close User Vault account", () => {
        const data = coder.instruction.encode("close", {});

        const ix = new TransactionInstruction({
            keys: [
                { pubkey: payer.publicKey, isSigner: true, isWritable: true },
                { pubkey: userVault, isSigner: false, isWritable: true },
                { pubkey: userVaultLamports, isSigner: false, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            programId,
            data
        });
        const tx = new Transaction().add(ix);
        tx.feePayer = payer.publicKey;
        tx.recentBlockhash = svm.latestBlockhash();
        tx.sign(payer);

        const res = svm.sendTransaction(tx);
        // console.log(res.toString());

        const userVaultInfo = svm.getAccount(userVault);
        // console.log({ userVaultInfo });

        const userLampAccount = svm.getBalance(userVaultLamports);
        // console.log({ userLampAccount });

        assert.equal(Number(userLampAccount), 0);
        assert.equal(userVaultInfo, null);
    })

    const expectCustomError = (res: unknown, code: number) => {
        assert.instanceOf(res, FailedTransactionMetadata);
        const errString = (res as FailedTransactionMetadata).err().toString();

        assert.include(errString, `${code}`);
    };
})