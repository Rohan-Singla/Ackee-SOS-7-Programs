//-------------------------------------------------------------------------------
use crate::events::ToggleLockEvent;
use crate::state::Vault;
///
/// TASK: Implement the toggle lock functionality for the on-chain vault
///
/// Requirements:
/// - Toggle the locked state of the vault (locked becomes unlocked, unlocked becomes locked)
/// - Only the vault authority should be able to toggle the lock
/// - Emit a toggle lock event after successful state change
///
///-------------------------------------------------------------------------------
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ToggleLock<'info> {
    #[account(mut)]
    pub vault_authority: Signer<'info>,

    #[account(
        mut,
        has_one = vault_authority
    )]
    pub vault: Account<'info, Vault>,
}

pub fn _toggle_lock(ctx: Context<ToggleLock>) -> Result<()> {
    let vault_key = ctx.accounts.vault.key();
    let vault_authority_key = ctx.accounts.vault_authority.key();

    let vault = &mut ctx.accounts.vault;
    vault.locked = !vault.locked;

    emit!(ToggleLockEvent {
        vault: vault_key,
        vault_authority: vault_authority_key,
        locked: vault.locked,
    });

    Ok(())
}
