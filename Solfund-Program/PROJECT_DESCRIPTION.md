# Project Description

**Deployed Frontend URL:** https://solfund-frontend.vercel.app/

**Solana Program ID:** EW2gBEZnq5CvP4nTMAeKD1AsEMDC5RtjzfE5ofPujvPv

## Project Overview

### Description
Solfund is a decentralized crowdfunding dApp built on Solana and deployed on devnet. It enables project creators to launch campaigns with a funding goal and deadline. Contributors can donate SOL to active campaigns. If the goal is met, the campaign creator can withdraw the funds. If the goal is not met by the deadline, contributors are eligible for refunds.

### Key Features

- Create Campaigns: Any user can start a new campaign with a title, description, funding goal, and deadline.

- Tracks deadline onchain 

- Donate to Campaigns: Contributors can securely donate SOL to a campaign.

- End Campaigns: Once the campaign deadline passes, no one can donate to that campaign now and says campaign is over.

- Withdraw Funds: If successful, the campaign creator can withdraw the funds.

- Refunds: If unsuccessful, contributors can claim refunds for their donations.
  
### How to Use the dApp

1. **Connect Wallet**
2. **Create Campaign**: Enter campaign details (title, description, goal, deadline). Confirm the transaction. (Also 1 account can only create 1 campaign u need to create a new account to create a new campaign.)
3. **Donate to Campaign** Select a campaign. Enter the amount of SOL to donate. Confirm the transaction.
4. **Withdraw / Refund** If successful → Campaign creator can withdraw funds. If failed → Contributors can claim refunds.

## Program Architecture
The Solfund dApp uses a modular architecture with two main account types and five core instructions. The program leverages Program Derived Addresses (PDAs) to create unique accounts for campaigns and contributions, ensuring data isolation, secure fund management, and preventing conflicts between different users’ campaigns or donations.
### PDA Usage
The program uses Program Derived Addresses (PDAs) to manage campaign and contribution accounts deterministically.
**PDAs Used:**
- Campaign PDA: Derived from [b"campaign", creator.key().as_ref()].
Purpose: Stores all data related to a specific crowdfunding campaign. The PDA is uniquely derived from the campaign creator’s wallet, ensuring that each creator can launch only one campaign from a unique wallet.

- Contribution PDA: Derived from Seeds: [b"contribution", campaign.key().as_ref(), contributor.key().as_ref()]
  Purpose: Tracks individual user contributions to a given campaign. Each contributor gets a unique PDA per campaign, ensuring no overlap between contributors and enabling accurate refunds/claims.

### Program Instructions

**Instructions Implemented:**
- Initialize Campaign: Creates a new campaign PDA and stores campaign details (Unique campaign for each account of solana).
- Contribute: Initializes or updates a contribution PDA for the contributor and transfers SOL into the campaign escrow.
- Withdraw :Allows the campaign creator to withdraw funds if the campaign goal was met .
- Refund : Allows contributors to withdraw their contributions if the campaign failed to meet the goal before deadline.

### Account Structure

```rust
#[account]
pub struct Campaign {
    pub creator: Pubkey,       // The wallet address of the campaign creator
    pub goal_amount: u64,      // The fundraising goal (in lamports)
    pub total_donated: u64,    // Total amount of lamports donated so far
    pub deadline: i64,         // Unix timestamp representing campaign end time
    pub is_withdrawn: bool,    // Flag indicating if funds have already been withdrawn by the creator
}

#[account]
pub struct Contribution {
    pub contributor: Pubkey,   // The wallet address of the contributor
    pub amount: u64,           // Amount of lamports contributed to the campaign
}

```

## Testing

### Test Coverage
The test suite uses the Anchor testing framework with a local validator.  
It validates core functionality of the crowdfunding program, including campaign creation, contributions, refunds, withdrawals.

**Happy Path Tests:**
- **Initialize Campaign**: Creates a new campaign PDA for the wallet and verifies the stored `creator` and `goal_amount`.
- **Contribute to Campaign**: Sends a contribution to the campaign, updates `total_donated`, and ensures the amount is recorded correctly.
- **Withdraw After Success**: Attempts withdrawal by the campaign creator (with airdropped funds simulating success) and checks that `is_withdrawn` is set to `true`.

**Unhappy Path Tests:**
- **Refund Before Goal Reached**: Attempts to refund before campaign success or deadline, which correctly fails with an error.
- **Withdraw Without Goal Met**: Withdrawal may fail if the goal isn’t reached before the deadline, ensuring funds remain locked.

### Running Tests
```bash
cd anchor-program
pnpm install
anchor test
```

### Additional Notes for Evaluators

This was my first Solana dApp and the learning curve was steep! The biggest challenges were figuring out PDA's and dealing with client side interaction with the contracts. PDAs were confusing at first but once they clicked, the deterministic addressing made everything much cleaner.
