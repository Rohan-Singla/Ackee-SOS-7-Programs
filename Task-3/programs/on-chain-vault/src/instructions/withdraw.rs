use crate::errors::VaultError;
use crate::events::WithdrawEvent;
use crate::state::Vault;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault_authority.key().as_ref()],
        bump = vault.bump,
        has_one = vault_authority
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut, address = vault.vault_authority)]
    pub vault_authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn _withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let vault = &ctx.accounts.vault;
    let vault_info = vault.to_account_info();
    let authority_info = ctx.accounts.vault_authority.to_account_info();

    // Ensure the vault is not locked
    if vault.locked {
        return err!(VaultError::VaultLocked);
    }

    // Ensure vault has enough lamports
    if **vault_info.lamports.borrow() < amount {
        return err!(VaultError::InsufficientBalance);
    }

    // Transfer lamports from vault to authority
    **vault_info.try_borrow_mut_lamports()? -= amount;
    **authority_info.try_borrow_mut_lamports()? += amount;

    // Emit event
    emit!(WithdrawEvent {
        vault: ctx.accounts.vault.key(),
        vault_authority: ctx.accounts.vault_authority.key(),
        amount,
    });

    Ok(())
}
