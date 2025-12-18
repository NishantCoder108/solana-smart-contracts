import { address } from '@solana/kit';

export const VAULT_PROGRAM_ID = address('DJktBCt1vV8jdYmyxqnH8oNVa5PMLWgkc7WuT4KB1Q8o');

// seeds
export const USER_VAULT_SEED = [118, 97, 117, 108, 116];
export const USER_VAULT_LAMPORTS_SEED = [117, 115, 101, 114, 95, 108, 97, 109, 112, 111, 114, 116, 115];



// instruction discriminator (IDL → bytes)
export const INITIALIZE_DISCRIMINATOR = [175, 175, 109, 31, 13, 152, 155, 237];
export const WITHDRAW_DISCRIMINATOR = [183, 18, 70, 156, 148, 109, 161, 34];
export const DEPOSIT_DISCRIMINATOR = [242, 35, 198, 137, 82, 225, 242, 182];
export const CLOSE_DISCRIMINATOR = [98, 165, 201, 177, 108, 65, 206, 96];