import { LiteSVM } from "litesvm";
import anchor from "@coral-xyz/anchor";
import { assert, expect } from "chai";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, AccountLayout, ACCOUNT_SIZE, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, MINT_SIZE } from "@solana/spl-token";
import Idl from "../target/idl/staking.json" with { type: "json" };


describe("LiteSVM: Staking", () => {
    const svm = new LiteSVM();
    const programId = new PublicKey(Idl.address);
    const coder = new anchor.BorshCoder(Idl as anchor.Idl);

    const poolCreator = Keypair.generate();
    const staker = Keypair.generate();
    svm.airdrop(poolCreator.publicKey, BigInt(10 * LAMPORTS_PER_SOL));
    svm.airdrop(staker.publicKey, BigInt(5 * LAMPORTS_PER_SOL));

    const programPath = new URL("../target/deploy/staking.so", import.meta.url).pathname;
    svm.addProgramFromFile(programId, programPath);

    const usdcMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");


    const [poolPda] = PublicKey.findProgramAddressSync([
        Buffer.from("pool"),
        poolCreator.publicKey.toBuffer(),
    ], programId);

    const poolVault = getAssociatedTokenAddressSync(usdcMint, poolPda, true);

    const MakerHaveUsdc = BigInt(1_000_000_000_000);
    const TakerHaveBonk = BigInt(50_000_000_000);
    const makerOfferedAmount = new anchor.BN(3000 * 10 ** 6); // USDC
    const makerExpectedAmount = new anchor.BN(6000 * 10 ** 6); // BONK

    before("Initialized MINT token", () => {
        const usdcMintAuthority = PublicKey.unique();


        const usdcMintData = Buffer.alloc(MINT_SIZE);


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

        svm.setAccount(usdcMint, {
            lamports: 1_000_000_000,
            data: usdcMintData,
            owner: TOKEN_PROGRAM_ID,
            executable: false,
        });

        const usdcMintAcct = svm.getAccount(usdcMint);
        const uMintData = usdcMintAcct?.data;
        const usdcDecoded = MintLayout.decode(uMintData);
        expect(usdcMintAcct).to.not.be.null;
        expect(uMintData).to.not.be.undefined;
        expect(usdcDecoded.isInitialized).to.equal(true);
        expect(usdcDecoded.decimals).to.equal(6);
    })


    it("Initialize Pool", async () => {
        const data = coder.instruction.encode("initialize_pool", {});

        const ix = new TransactionInstruction({
            keys: [
                { pubkey: poolCreator.publicKey, isSigner: true, isWritable: true },
                { pubkey: poolPda, isSigner: false, isWritable: true },
                { pubkey: usdcMint, isSigner: false, isWritable: false },
                { pubkey: poolVault, isSigner: false, isWritable: true },
                { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            programId,
            data
        })

        const tx = new Transaction().add(ix);
        tx.recentBlockhash = svm.latestBlockhash();
        tx.feePayer = poolCreator.publicKey;
        tx.sign(poolCreator);

        const res = svm.sendTransaction(tx);

        const poolAccInfo = svm.getAccount(poolPda);
        const poolAcc = coder.accounts.decode("Pool", Buffer.from(poolAccInfo.data));

        assert.equal(usdcMint.toString(), poolAcc.mint.toString());
        assert.equal(poolVault.toString(), poolAcc.vault.toString());
        assert.equal(poolAcc.reward_rate, 1);
        assert.equal(poolAcc.total_staked, 0);
    });
})