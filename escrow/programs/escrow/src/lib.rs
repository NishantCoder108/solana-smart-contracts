use anchor_lang::prelude::*;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
declare_id!("7ttjDw7MEBJqCaxNc33GozzyH4EHmisaenM8QoyyU4c9");

#[program]
pub mod escrow {
    use super::*;

    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        give_mint: Pubkey,
        give_amount: u64,
        want_mint: Pubkey,
        want_amount: u64,
    ) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);

        instructions::initialize::handler(ctx, give_mint, give_amount, want_mint, want_amount)
    }

    pub fn deposit_give(ctx: Context<DepositGive>) -> Result<()> {
        instructions::deposit_give::handler(ctx)
    }

    pub fn deposit_want<'a>(ctx: Context<'a, 'a, 'a, 'a, DepositWant<'a>>) -> Result<()> {
        instructions::deposit_want::handler(ctx)
    }

    // pub fn settle(ctx: Context<instructions::settle::Settle>) -> Result<()> {
    //     instructions::settle::handler(ctx)
    // }
    pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
        instructions::cancel::handler(ctx)
    }
}
