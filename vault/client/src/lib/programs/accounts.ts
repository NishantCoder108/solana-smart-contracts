import { Address, address, getAddressEncoder, getProgramDerivedAddress } from '@solana/kit';
import { VAULT_PROGRAM_ID, USER_VAULT_SEED, USER_VAULT_LAMPORTS_SEED } from './constants';

const userVaultSeed = Buffer.from(USER_VAULT_SEED);
const userVaultLamportsSeed = Buffer.from(USER_VAULT_LAMPORTS_SEED);


export async function getUserVaultPdas(user: string): Promise<{ userVault: string, userVaultLamports: string }> {
    // Get the userVault PDA
    const [userVaultPda] = await getProgramDerivedAddress({
        programAddress: VAULT_PROGRAM_ID,
        seeds: [
            userVaultSeed,
            getAddressEncoder().encode(address(user)),
        ],
    });

    // Get the userVaultLamports PDA, using the userVault PDA as a seed
    const [userVaultLamportsPda] = await getProgramDerivedAddress({
        programAddress: VAULT_PROGRAM_ID,
        seeds: [
            userVaultLamportsSeed,
            getAddressEncoder().encode(address(user)),
            getAddressEncoder().encode(userVaultPda),
        ],
    });

    return {
        userVault: userVaultPda,
        userVaultLamports: userVaultLamportsPda
    };
}