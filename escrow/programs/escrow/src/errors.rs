use anchor_lang::prelude::*;

#[error_code]
pub enum EscrowError {
    #[msg("Escrow already has a taker")]
    AlreadyTaken,

    #[msg("Asset already deposited")]
    AlreadyDeposited,

    #[msg("Invalid mint")]
    InvalidMint,

    #[msg("Invalid account")]
    InvalidAccounts,

    #[msg("Invalid vault")]
    InvalidVault,

    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("Escrow not ready for settlement")]
    NotReady,

    #[msg("Cannot cancel after taker deposit")]
    CannotCancel,
}
