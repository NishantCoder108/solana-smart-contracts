import { LiteSVM } from "litesvm";
import anchor from "@coral-xyz/anchor";
import { assert, expect } from "chai";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, AccountLayout, ACCOUNT_SIZE, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, MINT_SIZE } from "@solana/spl-token";
import Idl from "../target/idl/escrow.json" with { type: "json" };

describe("LiteSVM: Escrow", () => {
    const svm = new LiteSVM();
    const programId = new PublicKey(Idl.address);
    const coder = new anchor.BorshCoder(Idl as anchor.Idl);

    const maker = Keypair.generate();
    const taker = Keypair.generate();
    svm.airdrop(maker.publicKey, BigInt(10 * LAMPORTS_PER_SOL));
    svm.airdrop(taker.publicKey, BigInt(5 * LAMPORTS_PER_SOL));

    const programPath = new URL("../target/deploy/escrow.so", import.meta.url).pathname;
    svm.addProgramFromFile(programId, programPath);

    const usdcMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    const bonkMint = new PublicKey("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263");

    const [escrowPda] = PublicKey.findProgramAddressSync([
        Buffer.from("escrow"),
        maker.publicKey.toBuffer(),
        new anchor.BN(1).toArrayLike(Buffer, "le", 8)
    ], programId);

    const makerAtaM = getAssociatedTokenAddressSync(usdcMint, maker.publicKey, true);
    const takerAtaM = getAssociatedTokenAddressSync(usdcMint, taker.publicKey, true);
    const takerAtaN = getAssociatedTokenAddressSync(bonkMint, taker.publicKey, true);
    const makerAtaN = getAssociatedTokenAddressSync(bonkMint, maker.publicKey, true);
    const vaultAtaM = getAssociatedTokenAddressSync(usdcMint, escrowPda, true);

    const MakerHaveUsdc = BigInt(1_000_000_000_000);
    const TakerHaveBonk = BigInt(50_000_000_000);
    const makerOfferedAmount = new anchor.BN(3000 * 10 ** 6); // USDC
    const makerExpectedAmount = new anchor.BN(6000 * 10 ** 6); // BONK

    before("Initialized MINT token", () => {
        const usdcMintAuthority = PublicKey.unique();
        const bonkMintAuthority = PublicKey.unique();

        const usdcMintData = Buffer.alloc(MINT_SIZE);
        const bonkMintData = Buffer.alloc(MINT_SIZE);

        MintLayout.encode(
            {
                mintAuthorityOption: 1,
                mintAuthority: usdcMintAuthority,
                supply: BigInt(0),
                decimals: 6,
                isInitialized: true,
                freezeAuthorityOption: 0,
                freezeAuthority: PublicKey.default,
            },
            usdcMintData
        );

        MintLayout.encode(
            {
                mintAuthorityOption: 1,
                mintAuthority: bonkMintAuthority,
                supply: BigInt(0),
                decimals: 6,
                isInitialized: true,
                freezeAuthorityOption: 0,
                freezeAuthority: PublicKey.default,
            },
            bonkMintData
        );

        svm.setAccount(usdcMint, {
            lamports: 1_000_000_000,
            data: usdcMintData,
            owner: TOKEN_PROGRAM_ID,
            executable: false,
        });

        svm.setAccount(bonkMint, {
            lamports: 1_000_000_000,
            data: bonkMintData,
            owner: TOKEN_PROGRAM_ID,
            executable: false,
        });

        const bonkMintAcct = svm.getAccount(bonkMint);
        const bMintData = bonkMintAcct?.data;
        const bonkDecoded = MintLayout.decode(bMintData);
        expect(bonkMintAcct).to.not.be.null;
        expect(bMintData).to.not.be.undefined;
        expect(bonkDecoded.isInitialized).to.equal(true);
        expect(bonkDecoded.decimals).to.equal(6);

        const usdcMintAcct = svm.getAccount(usdcMint);
        const uMintData = usdcMintAcct?.data;
        const usdcDecoded = MintLayout.decode(uMintData);
        expect(usdcMintAcct).to.not.be.null;
        expect(uMintData).to.not.be.undefined;
        expect(usdcDecoded.isInitialized).to.equal(true);
        expect(usdcDecoded.decimals).to.equal(6);
    });

    before("Initialized ATA (Associated Token Account)", () => {
        const makerAccData = Buffer.alloc(ACCOUNT_SIZE);
        const takerAccData = Buffer.alloc(ACCOUNT_SIZE);

        AccountLayout.encode(
            {
                mint: usdcMint,
                owner: maker.publicKey,
                amount: MakerHaveUsdc,
                delegateOption: 0,
                delegate: PublicKey.default,
                delegatedAmount: BigInt(0),
                state: 1,
                isNativeOption: 0,
                isNative: BigInt(0),
                closeAuthorityOption: 0,
                closeAuthority: PublicKey.default,
            },
            makerAccData,
        );

        svm.setAccount(makerAtaM, {
            lamports: 1_000_000_000,
            data: makerAccData,
            owner: TOKEN_PROGRAM_ID,
            executable: false,
        });

        AccountLayout.encode(
            {
                mint: bonkMint,
                owner: taker.publicKey,
                amount: TakerHaveBonk,
                delegateOption: 0,
                delegate: PublicKey.default,
                delegatedAmount: BigInt(0),
                state: 1,
                isNativeOption: 0,
                isNative: BigInt(0),
                closeAuthorityOption: 0,
                closeAuthority: PublicKey.default,
            },
            takerAccData,
        );

        svm.setAccount(takerAtaN, {
            lamports: 1_000_000_000,
            data: takerAccData,
            owner: TOKEN_PROGRAM_ID,
            executable: false,
        });

        const makerRawAccount = svm.getAccount(makerAtaM);
        const makerDecoded = AccountLayout.decode(makerRawAccount?.data);
        const takerRawAccount = svm.getAccount(takerAtaN);
        const takerDecoded = AccountLayout.decode(takerRawAccount?.data);

        expect(makerRawAccount, "Maker's ATA should exist after mint/ATA setup").to.not.be.null;
        expect(makerDecoded.amount, "Maker's ATA should hold the correct initial USDC amount").to.eql(MakerHaveUsdc);
        expect(takerRawAccount, "Taker's ATA should exist after mint/ATA setup").to.not.be.null;
        expect(takerDecoded.amount, "Taker's ATA should hold the correct initial USDC amount").to.eql(TakerHaveBonk);
    });

    it("Maker: Creates an escrow and deposits funds", async () => {
        const { ixArgs } = await makerDeposit();

        const makerAtaMAccInfo = getDecodedAccount(makerAtaM);
        const vaultAtaMAccInfo = getDecodedAccount(vaultAtaM);
        const escrowAccInfo = svm.getAccount(escrowPda);
        const escrowAcc = coder.accounts.decode("Escrow", Buffer.from(escrowAccInfo.data));

        assert.equal(usdcMint.toString(), escrowAcc.mint_m.toString());
        assert.equal(bonkMint.toString(), escrowAcc.mint_n.toString());
        assert.equal(ixArgs.seed.toNumber(), escrowAcc.seed.toNumber());
        assert.equal(ixArgs.token_mint_n_expected.toNumber(), escrowAcc.token_mint_n_expected.toNumber());
        assert.equal(ixArgs.amount.toNumber(), Number(vaultAtaMAccInfo.amount));
        assert.equal(Number(MakerHaveUsdc) - Number(ixArgs.amount), Number(makerAtaMAccInfo.amount));
    });


    it("Taker: Deposits expected funds and withdraws offered funds", async () => {
        await makerDeposit();

        const ix = getTakerIx();
        const tx = new Transaction().add(ix);
        tx.feePayer = taker.publicKey;
        tx.recentBlockhash = svm.latestBlockhash();
        tx.sign(taker);
        svm.sendTransaction(tx);

        const makerAtaMAccInfo = getDecodedAccount(makerAtaM);
        const takerAtaNAccInfo = getDecodedAccount(takerAtaN);

        const escrowAccInfo = svm.getAccount(escrowPda);
        const vaultAtaMAcc = svm.getAccount(vaultAtaM);

        assert.isNull(vaultAtaMAcc, "Vault ATA should be closed after taker's withdrawal");
        assert.isNull(escrowAccInfo, "Escrow account should be closed after taker's withdrawal");
        assert.equal(
            Number(MakerHaveUsdc) - Number(makerOfferedAmount),
            Number(makerAtaMAccInfo.amount),
            "Maker's ATA should contain remaining USDC after deposit"
        );
        assert.equal(
            Number(TakerHaveBonk) - Number(makerExpectedAmount),
            Number(takerAtaNAccInfo.amount),
            "Taker's ATA should contain remaining BONK after deposit"
        );
    });

    it("Refund: Close an escrow and withdraws funds", async () => {
        // Setup escrow before refund
        const { ixArgs } = await makerDeposit();

        const ix = getRefundIx();
        const tx = new Transaction().add(ix);
        tx.feePayer = maker.publicKey;
        tx.recentBlockhash = svm.latestBlockhash();
        tx.sign(maker);
        svm.sendTransaction(tx);

        const escrowAccount = svm.getAccount(escrowPda);
        assert.isNull(escrowAccount, "Escrow account should be closed after refund");

        const vaultAccount = svm.getAccount(vaultAtaM);
        assert.isNull(vaultAccount, "Vault ATA should be closed after refund");

        const makerAtaMAccAfter = svm.getAccount(makerAtaM);
        const makerAtaMAccInfoAfter = AccountLayout.decode(makerAtaMAccAfter.data);
        assert.equal(
            Number(makerAtaMAccInfoAfter.amount),
            Number(MakerHaveUsdc) - Number(ixArgs.amount),
            "Maker's ATA should be fully refunded"
        );
    });

    const makerDeposit = async () => {
        const ixArgs = {
            amount: makerOfferedAmount,
            token_mint_n_expected: makerExpectedAmount,
            seed: new anchor.BN(1),
        };
        const data = coder.instruction.encode("maker", ixArgs);
        const ix = new TransactionInstruction({
            keys: [
                { pubkey: maker.publicKey, isSigner: true, isWritable: true },
                { pubkey: escrowPda, isSigner: false, isWritable: true },
                { pubkey: usdcMint, isSigner: false, isWritable: false },
                { pubkey: bonkMint, isSigner: false, isWritable: false },
                { pubkey: makerAtaM, isSigner: false, isWritable: true },
                { pubkey: vaultAtaM, isSigner: false, isWritable: true },
                { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            programId,
            data
        });
        const tx = new Transaction().add(ix);
        tx.feePayer = maker.publicKey;
        tx.recentBlockhash = svm.latestBlockhash();
        tx.sign(maker);
        svm.sendTransaction(tx);

        return { ixArgs };
    }

    function getDecodedAccount(address: PublicKey) {
        const acc = svm.getAccount(address);
        if (!acc) return null;
        return AccountLayout.decode(acc.data);
    }

    const getRefundIx = () => {
        return new TransactionInstruction({
            keys: [
                { pubkey: maker.publicKey, isSigner: true, isWritable: true },
                { pubkey: escrowPda, isSigner: false, isWritable: true },
                { pubkey: usdcMint, isSigner: false, isWritable: false },
                { pubkey: bonkMint, isSigner: false, isWritable: false },
                { pubkey: makerAtaM, isSigner: false, isWritable: true },
                { pubkey: vaultAtaM, isSigner: false, isWritable: true },
                { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            programId,
            data: coder.instruction.encode("refund", {}),
        });
    }

    const getTakerIx = () => {
        return new TransactionInstruction({
            keys: [
                { pubkey: taker.publicKey, isSigner: true, isWritable: true },
                { pubkey: maker.publicKey, isSigner: false, isWritable: true },
                { pubkey: escrowPda, isSigner: false, isWritable: true },
                { pubkey: usdcMint, isSigner: false, isWritable: false },
                { pubkey: bonkMint, isSigner: false, isWritable: false },
                { pubkey: vaultAtaM, isSigner: false, isWritable: true },
                { pubkey: takerAtaM, isSigner: false, isWritable: true },
                { pubkey: takerAtaN, isSigner: false, isWritable: true },
                { pubkey: makerAtaN, isSigner: false, isWritable: true },
                { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            programId,
            data: coder.instruction.encode("taker", {}),
        });
    }
});

