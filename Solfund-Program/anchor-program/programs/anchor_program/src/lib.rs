use anchor_lang::prelude::*;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("EW2gBEZnq5CvP4nTMAeKD1AsEMDC5RtjzfE5ofPujvPv");

// Deployed Address on Devnet EW2gBEZnq5CvP4nTMAeKD1AsEMDC5RtjzfE5ofPujvPv

#[program]
pub mod anchor_program {
    use super::*;

    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        goal_amount: u64,
        deadline: i64,
    ) -> Result<()> {
        initialize_campaign::handler(ctx, goal_amount, deadline)
    }

    pub fn contribute(ctx: Context<Contribute>, amount: u64) -> Result<()> {
        contribute::handler(ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        withdraw::handler(ctx)
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        refund::handler(ctx)
    }
}
