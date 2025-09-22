use anchor_lang::prelude::*;

#[event]
pub struct CampaignCreated {
    pub creator: Pubkey,
    pub goal_amount: u64,
    pub deadline: i64,
}

#[event]
pub struct ContributionMade {
    pub contributor: Pubkey,
    pub amount: u64,
}

#[event]
pub struct Withdrawal {
    pub creator: Pubkey,
    pub amount: u64,
}

#[event]
pub struct RefundIssued {
    pub contributor: Pubkey,
    pub amount: u64,
}
