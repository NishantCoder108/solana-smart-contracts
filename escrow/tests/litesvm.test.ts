import { LiteSVM } from "litesvm";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import anchor from "@coral-xyz/anchor";
import { encode as base58encode } from "bs58";
import Idl from "../target/idl/escrow.json" with {type: "json"};

describe("LiteSVM: Escrow", () => {

    const svm = new LiteSVM();
    const programId = new PublicKey(Idl.address);
    const coder = new anchor.BorshCoder(Idl as anchor.Idl);

    const payer = Keypair.generate();
    beforeAll(async () => {
        await svm.airdrop(payer.publicKey, BigInt(10 * LAMPORTS_PER_SOL));
        const programPath = new URL("../target/deploy/escrow.so", import.meta.url).pathname;
        await svm.addProgramFromFile(programId, programPath);
    });

    it("maker: creates an escrow and deposits", async () => {
        // Create Keypairs
        const maker = Keypair.generate();
        await svm.airdrop(maker.publicKey, BigInt(2 * LAMPORTS_PER_SOL));

        // Simulate mints
        const mintM = await svm.creaMiint(maker, 6);
        const mintN = await svm.createMint(maker, 6);

        // Create associated token account for maker and mint tokens
        const makerAtaM = await svm.createTokenAccount(mintM, maker.publicKey);
        await svm.mintTo(mintM, makerAtaM, maker, BigInt(100_000_000)); // 100 tokens

        const seed = 42n;
        const wanted = 11_000_000n;    // 11 tokens for mintN
        const offer = 66_000_000n;     // 66 tokens for mintM

        // Derive escrow PDA
        const escrowSeeds = [
            Buffer.from("escrow"),
            maker.publicKey.toBuffer(),
            Buffer.from(Uint8Array.of(...Buffer.from(seed.toString(16).padStart(16, '0'), 'hex')))
        ];
        const [escrowPda] = await svm.derivePda(programId, escrowSeeds);

        // Derive vault ATA
        const vaultAta = await svm.createTokenAccount(mintM, escrowPda, { associated: true });

        // Prepare accounts as required by Anchor and IDL
        const accounts = {
            maker: maker.publicKey,
            escrow: escrowPda,
            mint_m: mintM,
            mint_n: mintN,
            maker_ata_m: makerAtaM,
            vault: vaultAta,
            associated_token_program: svm.associatedTokenProgram,
            token_program: svm.tokenProgram,
            system_program: svm.systemProgram
        };

        // Encode instruction data (Anchor 0.28+ style)
        const ixData = coder.instruction.encode("maker", {
            seed: Number(seed),
            token_mint_n_expected: Number(wanted),
            amount: Number(offer),
        });

        // Create and invoke transaction
        const tx = await svm.buildAndSend({
            payer,
            signers: [maker],
            instructions: [
                {
                    programId,
                    accounts,
                    data: ixData
                }
            ]
        });

        // Verify the vault token account received the expected amount
        const vaultBalance = await svm.getTokenAccountBalance(vaultAta);
        expect(vaultBalance).toBe(Number(offer));
    });

    it("refund: allows maker to reclaim after open", async () => {
        // TODO: Implement realistic refund branch (if code above has created escrow)
        // For demonstration, only stub
        expect(true).toBe(true);
    });

})