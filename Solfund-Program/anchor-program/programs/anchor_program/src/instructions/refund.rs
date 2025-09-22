use crate::errors::*;
use crate::events::*;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    pub contributor: Signer<'info>,

    #[account(mut)]
    pub campaign: Account<'info, Campaign>,

    #[account(
        mut,
        seeds = [b"contribution", campaign.key().as_ref(), contributor.key().as_ref()],
        bump,
        close = contributor
    )]
    pub contribution: Account<'info, Contribution>,
}

pub fn handler(ctx: Context<Refund>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    let contribution = &mut ctx.accounts.contribution;

    if Clock::get()?.unix_timestamp < campaign.deadline {
        return err!(CrowdfundError::CampaignNotFinished);
    }

    if campaign.total_donated >= campaign.goal_amount {
    return err!(CrowdfundError::RefundNotAllowed);
    }

    if contribution.amount == 0 {
        return err!(CrowdfundError::NoContribution);
    }

    if campaign.is_withdrawn {
        return err!(CrowdfundError::AlreadyWithdrawn);
    }

    let refund_amount = contribution.amount;
    **ctx
        .accounts
        .campaign
        .to_account_info()
        .lamports
        .borrow_mut() -= refund_amount;
    **ctx
        .accounts
        .contributor
        .to_account_info()
        .lamports
        .borrow_mut() += refund_amount;

    emit!(RefundIssued {
        contributor: ctx.accounts.contributor.key(),
        amount: refund_amount,
    });

    Ok(())
}
