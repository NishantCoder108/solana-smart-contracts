#[event]
pub struct EscrowReady {
    pub escrow: Pubkey,
    pub maker: Pubkey,
    pub taker: Pubkey,
}
