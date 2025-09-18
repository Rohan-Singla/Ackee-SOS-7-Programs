mod tests;

#[allow(unused_doc_comments)]
pub mod questions {
    pub fn question_1() -> char {
        /// What vulnerability is present in the following code?
        ///
        /// #[account]
        /// pub struct Config {
        ///     pub admin: Pubkey,
        ///     pub value: u8
        /// }
        ///
        /// #[derive(Accounts)]
        /// pub struct UpdateConfig<'info> {
        ///     pub admin: Signer<'info>,
        ///     #[account(
        ///         mut,
        ///         seeds = [b"config"],
        ///         bump
        ///     )]
        ///     pub config: Account<'info, Config>
        /// }
        ///
        /// pub fn update_config(ctx: Context<UpdateConfig>, data: u8) -> Result<()> {
        ///    
        ///     if !ctx.accounts.admin.is_signer {
        ///         return Err(ProgramError::MissingRequiredSignature.into());
        ///     }
        ///
        ///     let config = &mut ctx.accounts.config;
        ///     config.value = data;
        ///     Ok(())
        /// }
        ///
        /// a) The config account should always be immutable, this instruction should not exist.
        /// b) The config account is not reloaded after a CPI.
        /// c) Anyone can update the config.
        /// d) The update config instruction is safe and does not contain any vulnerability.
        'c'
    }
    pub fn question_2() -> char {
        /// How can account reloading vulnerability be prevented?
        ///
        /// a) It cannot be prevented because of Solana's runtime policy.
        /// b) By calling two CPIs in a row.
        /// c) By calling reload() on the accounts modified by the CPI.
        /// d) By ensuring all of the accounts included in the CPI are rent-exempt.
        'c'
    }
    pub fn question_3() -> char {
        /// Which of the following conditions must be met for the balances of all accounts after a transaction?
        ///
        /// a) Balances must show a net positive gain.
        /// b) The sum of the balances before and after the transaction must remain the same.
        /// c) Balances of read-only accounts must increase.
        /// d) Balances must reflect transaction fees deducted.
        'd'
    }
    pub fn question_4() -> char {
        /// How can you prevent an account from being re-initialized and having its existing data overridden?
        ///
        /// a) By using an account discriminator or an initialization flag.
        /// b) By increasing the account's balance.
        /// c) By comparing the account's pubkey with another account.
        /// d) By checking if the account signed the transaction.
        'a'
    }
    pub fn question_5() -> char {
        /// How can you check that the correct program is being invoked before calling a CPI?
        ///
        /// a) By checking the executable account's balance.
        /// b) By ensuring that an authorized account is specified as the signer of the instruction which calls the CPI.
        /// c) By comparing the public key of the passed-in program with the program you expected.
        /// d) By checking the account's discriminator.
        'c'
    }
    pub fn question_6() -> char {
        /// How can you prevent the duplicate mutable accounts vulnerability?
        ///
        /// a) By comparing balances of the mutable accounts.
        /// b) By comparing the public keys of the accounts and throwing an error if they match.
        /// c) By checking if all accounts are initialized.
        /// d) By checking whether both account have the same owner.
        'b'
    }
    pub fn question_7() -> char {
        /// How does the find_program_address method differ from the create_program_address method?
        ///
        /// a) find_program_address uses the canonical bump for the PDA derivation.
        /// b) find_program_address derives a PDA without searching for the canonical bump.
        /// c) Both functions work the same, they only differ in name.
        /// d) It automatically stores the derived bump in an account's data field for later reference.
        'a'
    }
    pub fn question_8() -> char {
        /// Anyone can increase the account balance. Under what circumstances can the account balance be decreased?
        ///
        /// a) Every time the account signs a transaction.
        /// b) Only if the data stored in the account is zeroed out.
        /// c) This can be done only to accounts owned by the System Program.
        /// d) Account owner is able to subtract lamports from the account.
        'c'
    }
    pub fn question_9() -> char {
        /// How can you prevent the same PDA from being used for multiple accounts,
        /// thereby avoiding unauthorized access to data and funds?
        ///
        /// a) By setting the account's discriminator to CLOSED_ACCOUNT_DISCRIMINATOR.
        /// b) By using the same seeds for all accounts.
        /// c) By using user-specific and/or domain-specific seeds to prevent the same PDA from being used across different accounts.
        /// d) By making the account with the original PDA rent-exempt.
        'c'
    }
    pub fn question_10() -> char {
        /// Which of these things does Anchor's close constraint not do?
        ///
        /// a) It transfers all lamports to a specified account.
        /// b) It creates a new account to replace the closed one.
        /// c) It zeroes out the account data.
        /// d) It sets the account discriminator to CLOSED_ACCOUNT_DISCRIMINATOR.
        'b'
    }
}

fn main() {}
