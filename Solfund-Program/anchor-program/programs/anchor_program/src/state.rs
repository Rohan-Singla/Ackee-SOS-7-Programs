use anchor_lang::prelude::*;

#[account]
pub struct Campaign {
    pub creator: Pubkey,
    pub goal_amount: u64,
    pub total_donated: u64,
    pub deadline: i64,
    pub is_withdrawn: bool,
}

#[account]
pub struct Contribution {
    pub contributor: Pubkey,
    pub amount: u64,
}
