use anchor_lang::prelude::*;
mod errors;
mod instructions;
mod state;
use instructions::*;
declare_id!("KMYaZW7KUS6atp5F645vZ5ynuR6aZ7TueiTtTCRes6e");

#[program]
pub mod escrow {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn maker(
        ctx: Context<Maker>,
        seed: u64,
        token_mint_n_expected: u64,
        amount: u64,
    ) -> Result<()> {
        maker::handler(ctx, seed, token_mint_n_expected, amount)
    }

    #[instruction(discriminator = 1)]
    pub fn taker(ctx: Context<Taker>) -> Result<()> {
        taker::handler(ctx)
    }

    #[instruction(discriminator = 2)]
    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        refund::handler(ctx)
    }
}
