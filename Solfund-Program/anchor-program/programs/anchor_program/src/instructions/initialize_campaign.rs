use anchor_lang::prelude::*;
use crate::state::*;
use crate::events::*;

#[derive(Accounts)]
pub struct CreateCampaign<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 8 + 8 + 8 + 1,
        seeds = [b"campaign", creator.key().as_ref()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateCampaign>,
    goal_amount: u64,
    deadline: i64,
) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    campaign.creator = ctx.accounts.creator.key();
    campaign.goal_amount = goal_amount;
    campaign.total_donated = 0;
    campaign.deadline = deadline;
    campaign.is_withdrawn = false;

    emit!(CampaignCreated {
        creator: campaign.creator,
        goal_amount,
        deadline,
    });

    Ok(())
}
