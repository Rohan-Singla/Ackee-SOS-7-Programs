use crate::errors::*;
use crate::events::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub contributor: Signer<'info>,

    #[account(mut)]
    pub campaign: Account<'info, Campaign>,

    #[account(
        init_if_needed,
        payer = contributor,
        space = 8 + 32 + 8,
        seeds = [b"contribution", campaign.key().as_ref(), contributor.key().as_ref()],
        bump
    )]
    pub contribution: Account<'info, Contribution>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Contribute>, amount: u64) -> Result<()> {
    let campaign_deadline = ctx.accounts.campaign.deadline;

    if ctx.accounts.campaign.is_withdrawn {
        return err!(CrowdfundError::AlreadyWithdrawn);
    }

    // ❌ Reject if deadline passed
    if Clock::get()?.unix_timestamp > campaign_deadline {
        return err!(CrowdfundError::DeadlinePassed);
    }

    let cpi_ctx = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        Transfer {
            from: ctx.accounts.contributor.to_account_info(),
            to: ctx.accounts.campaign.to_account_info(),
        },
    );
    transfer(cpi_ctx, amount)?;

    let campaign = &mut ctx.accounts.campaign;
    campaign.total_donated = campaign
        .total_donated
        .checked_add(amount)
        .ok_or(CrowdfundError::NumericalOverflow)?;

    let contribution = &mut ctx.accounts.contribution;
    contribution.contributor = ctx.accounts.contributor.key();
    contribution.amount = contribution
        .amount
        .checked_add(amount)
        .ok_or(CrowdfundError::NumericalOverflow)?;

    emit!(ContributionMade {
        contributor: contribution.contributor,
        amount,
    });

    Ok(())
}
