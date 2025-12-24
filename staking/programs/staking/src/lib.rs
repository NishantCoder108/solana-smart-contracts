use anchor_lang::prelude::*;

declare_id!("2t4tTkX9nEKuTHdZbVYYXwq188GBQQq35fh46xV1qBuw");

#[program]
pub mod staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
