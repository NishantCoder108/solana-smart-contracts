use anchor_lang::prelude::*;

#[derive(InitSpace)]
#[account(discriminator = 1)]
pub struct Escrow {
    pub seed: u64,      //This will generate random because of maker create multiple escrow
    pub maker: Pubkey,  // Maker's wallet address
    pub mint_m: Pubkey, //like USDC
    pub mint_n: Pubkey, // like BONK
    // pub token_mint_m_offered: u64, // 10 USDC
    pub token_mint_n_expected: u64, // 30 BONK
    pub bump: u8,                   //For re-generating - store bump
}
