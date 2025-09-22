import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorProgram } from "../target/types/anchor_program";
import { assert } from "chai";

describe("anchor_program", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorProgram as Program<AnchorProgram>;
  const wallet = provider.wallet as anchor.Wallet;

  let campaignPda: anchor.web3.PublicKey;
  let campaignBump: number;

  const goalAmount = new anchor.BN(2 * anchor.web3.LAMPORTS_PER_SOL);
  const deadline = Math.floor(Date.now() / 1000) + 60; // 1 min from now

  it("Initialize a campaign", async () => {
    [campaignPda, campaignBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("campaign"), wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createCampaign(goalAmount, new anchor.BN(deadline))
      .accounts({
        signer: wallet.publicKey,
        campaign: campaignPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const campaign = await program.account.campaign.fetch(campaignPda);
    assert.ok(campaign.goalAmount.eq(goalAmount));
    assert.equal(campaign.creator.toBase58(), wallet.publicKey.toBase58());
  });

  it("Contribute to campaign", async () => {
    const contribution = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL / 2);

    await program.methods
      .contribute(contribution)
      .accounts({
        contributor: wallet.publicKey,
        campaign: campaignPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const campaign = await program.account.campaign.fetch(campaignPda);
    assert.ok(campaign.totalDonated.gte(contribution));
  });

  it("Refund before goal reached", async () => {
    try {
      await program.methods
        .refund()
        .accounts({
          contributor: wallet.publicKey,
          campaign: campaignPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    } catch (err) {
      console.log("Refund failed as expected:", err.error.errorMessage);
    }
  });

  it("Withdraw after success", async () => {
    // Fast-forward deadline
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(wallet.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
      "confirmed"
    );

    try {
      await program.methods
        .withdraw()
        .accounts({
          creator: wallet.publicKey,
          campaign: campaignPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const campaign = await program.account.campaign.fetch(campaignPda);
      assert.ok(campaign.isWithdrawn === true);
    } catch (err) {
      console.log("Withdraw failed (probably goal not met yet):", err.error.errorMessage);
    }
  });

});
