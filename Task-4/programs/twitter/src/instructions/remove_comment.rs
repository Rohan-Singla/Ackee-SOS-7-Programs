//-------------------------------------------------------------------------------
///
/// TASK: Implement the remove comment functionality for the Twitter program
///
/// Requirements:
/// - Close the comment account and return rent to comment author
///
/// NOTE: No implementation logic is needed in the function body - this
/// functionality is achieved entirely through account constraints!
///
///-------------------------------------------------------------------------------
use anchor_lang::prelude::*;

use crate::states::*;

pub fn remove_comment(_ctx: Context<RemoveCommentContext>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct RemoveCommentContext<'info> {
    /// The original author of the comment; receives lamports back on close
    #[account(mut)]
    pub comment_author: Signer<'info>,
    /// Comment PDA to close; must be owned by the author
    #[account(
        mut,
        has_one = comment_author,
        close = comment_author
    )]
    pub comment: Account<'info, Comment>,
}
