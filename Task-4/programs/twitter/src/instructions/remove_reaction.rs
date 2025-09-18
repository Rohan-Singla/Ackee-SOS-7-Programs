//-------------------------------------------------------------------------------
///
/// TASK: Implement the remove reaction functionality for the Twitter program
///
/// Requirements:
/// - Verify that the tweet reaction exists and belongs to the reaction author
/// - Decrement the appropriate counter (likes or dislikes) on the tweet
/// - Close the tweet reaction account and return rent to reaction author
///
///-------------------------------------------------------------------------------
use anchor_lang::prelude::*;

use crate::errors::TwitterError;
use crate::states::*;

pub fn remove_reaction(ctx: Context<RemoveReactionContext>) -> Result<()> {
    let tweet = &mut ctx.accounts.tweet;
    let tweet_reaction = &ctx.accounts.tweet_reaction;

    // Decrement counters based on stored reaction type
    match tweet_reaction.reaction {
        ReactionType::Like => {
            tweet.likes = tweet
                .likes
                .checked_sub(1)
                .ok_or_else(|| error!(TwitterError::MinLikesReached))?;
        }
        ReactionType::Dislike => {
            tweet.dislikes = tweet
                .dislikes
                .checked_sub(1)
                .ok_or_else(|| error!(TwitterError::MinDislikesReached))?;
        }
    }

    Ok(())
}

#[derive(Accounts)]
pub struct RemoveReactionContext<'info> {
    /// The user who created the reaction; will receive rent lamports back
    #[account(mut)]
    pub reaction_author: Signer<'info>,
    /// Reaction PDA owned by the author; close to author on exit
    #[account(
        mut,
        seeds = [
            TWEET_REACTION_SEED.as_bytes(),
            reaction_author.key().as_ref(),
            tweet.key().as_ref(),
        ],
        bump = tweet_reaction.bump,
        close = reaction_author
    )]
    pub tweet_reaction: Account<'info, Reaction>,
    /// Parent tweet to update counters
    #[account(mut)]
    pub tweet: Account<'info, Tweet>,
}
