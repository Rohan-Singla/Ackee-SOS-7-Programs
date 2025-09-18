//-------------------------------------------------------------------------------
use crate::errors::VaultError;
use crate::events::DepositEvent;
use crate::state::Vault;
///
/// TASK: Implement the deposit functionality for the on-chain vault
///
/// Requirements:
/// - Verify that the user has enough balance to deposit
/// - Verify that the vault is not locked
/// - Transfer lamports from user to vault using CPI (Cross-Program Invocation)
/// - Emit a deposit event after successful transfer
///
///-------------------------------------------------------------------------------
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;

#[derive(Accounts)]
pub struct Deposit<'info> {
    /// CHECK: User sending the deposit (payer)
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Vault account that receives lamports
    #[account(mut, has_one = vault_authority)]
    pub vault: Account<'info, Vault>,

    /// CHECK: PDA authority of the vault
    pub vault_authority: AccountInfo<'info>,

    /// System program to invoke transfer
    pub system_program: Program<'info, System>,
}

pub fn _deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let vault = &ctx.accounts.vault;

    // Check if vault is locked
    if vault.locked {
        return err!(VaultError::VaultLocked);
    }

    // Check if user has enough balance
    let user_lamports = **ctx.accounts.user.to_account_info().lamports.borrow();
    if user_lamports < amount {
        return err!(VaultError::InsufficientBalance);
    }

    // Transfer lamports from user to vault
    invoke(
        &transfer(
            ctx.accounts.user.key,
            ctx.accounts.vault.to_account_info().key,
            amount,
        ),
        &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // Emit event
    emit!(DepositEvent {
        amount,
        user: ctx.accounts.user.key(),
        vault: ctx.accounts.vault.key(),
    });

    Ok(())
}
