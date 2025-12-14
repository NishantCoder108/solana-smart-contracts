use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::error::UserVaultError;
use crate::state::*;

pub fn deposit_vault(ctx: Context<DepositVault>, amount: u64) -> Result<()> {
    let from = &mut ctx.accounts.user;
    let to = &mut ctx.accounts.user_vault_lamports;
    let from_vault_acc = &mut ctx.accounts.user_vault;

    require!(amount > 0, UserVaultError::InvalidAmount);
    require_keys_eq!(
        from_vault_acc.user,
        from.key(),
        UserVaultError::NotVaultOwner
    );
    require_keys_eq!(
        from_vault_acc.user_vault_lamports,
        to.key(),
        UserVaultError::NotAuthorised
    );

    let program_id = ctx.accounts.system_program.to_account_info();

    let cpi_context = CpiContext::new(
        program_id,
        Transfer {
            from: from.to_account_info(),
            to: to.to_account_info(),
        },
    );

    transfer(cpi_context, amount)?;

    from_vault_acc.total_deposit = from_vault_acc
        .total_deposit
        .checked_add(amount)
        .ok_or(UserVaultError::InvalidAmount)?;
    Ok(())
}

#[derive(Accounts)]
pub struct DepositVault<'info> {
    #[account(mut)]
    user: Signer<'info>,

    #[account(
        mut,
        seeds=[b"vault",user.key().as_ref()],
        bump= user_vault.user_vault_bump,
    )]
    user_vault: Account<'info, UserVault>,

    #[account(
        mut,
        seeds=[b"user_lamports",user.key().as_ref(),user_vault.key().as_ref()],
        bump= user_vault.user_vault_lamports_bump
    )]
    user_vault_lamports: SystemAccount<'info>,

    system_program: Program<'info, System>,
}
