use anchor_lang::prelude::*;

#[error_code]
pub enum CrowdfundError {
    #[msg("The campaign deadline has passed.")]
    DeadlinePassed,

    #[msg("The campaign is not yet finished.")]
    CampaignNotFinished,

    #[msg("Goal not met, cannot withdraw.")]
    GoalNotMet,
    #[msg("Refund not allowed, goal was met.")]
    RefundNotAllowed,
    #[msg("Already withdrawn.")]
    AlreadyWithdrawn,

    #[msg("No contribution found to refund.")]
    NoContribution,

    #[msg("Numerical overflow occurred.")]
    NumericalOverflow,
}
