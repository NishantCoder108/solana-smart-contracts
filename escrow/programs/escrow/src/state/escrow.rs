use anchor_lang::prelude::*;

#[account]
pub struct Escrow {
    /// Maker who created the offer
    pub maker: Pubkey,

    /// Taker who accepts the offer
    pub taker: Option<Pubkey>,

    /// Asset maker gives
    /// Pubkey::default() = SOL
    pub give_mint: Pubkey,

    pub give_amount: u64,

    /// Asset maker wants
    /// Pubkey::default() = SOL
    pub want_mint: Pubkey,

    pub want_amount: u64,

    /// Has maker deposited?
    pub give_deposited: bool,

    /// Has taker deposited?
    pub want_deposited: bool,

    /// PDA bump
    pub bump: u8,
}

impl Escrow {
    pub const LEN: usize = 8 +                 // discriminator
        32 +                // maker
        1 + 32 +            // taker (Option<Pubkey>)
        32 +                // give_mint
        8 +                 // give_amount
        32 +                // want_mint
        8 +                 // want_amount
        1 +                 // give_deposited
        1 +                 // want_deposited
        1; // bump

    pub fn give_is_sol(&self) -> bool {
        self.give_mint == Pubkey::default()
    }

    pub fn want_is_sol(&self) -> bool {
        self.want_mint == Pubkey::default()
    }
}
