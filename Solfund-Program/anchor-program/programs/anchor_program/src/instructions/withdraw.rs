use crate::errors::CrowdfundError;
use crate::events::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::{emit, err};

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, has_one = creator)]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Withdraw>) -> Result<()> {
    let total_donated = ctx.accounts.campaign.total_donated;
    let goal_amount = ctx.accounts.campaign.goal_amount;
    let already_withdrawn = ctx.accounts.campaign.is_withdrawn;

    if total_donated < goal_amount {
        return err!(CrowdfundError::GoalNotMet);
    }
    if already_withdrawn {
        return err!(CrowdfundError::AlreadyWithdrawn);
    }

    let campaign_info = ctx.accounts.campaign.to_account_info();
    let creator_info = ctx.accounts.creator.to_account_info();

    let amount =
        **campaign_info.lamports.borrow() - Rent::get()?.minimum_balance(campaign_info.data_len());

    **campaign_info.try_borrow_mut_lamports()? -= amount;
    **creator_info.try_borrow_mut_lamports()? += amount;

    // Mark as withdrawn
    let campaign = &mut ctx.accounts.campaign;
    campaign.is_withdrawn = true;

    emit!(Withdrawal {
        creator: ctx.accounts.creator.key(),
        amount,
    });

    Ok(())
}
