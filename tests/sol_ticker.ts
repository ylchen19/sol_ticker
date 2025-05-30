import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolTicker } from "../target/types/sol_ticker";
import { expect } from "chai";
import { Keypair } from "@solana/web3.js";

describe("sol_ticker", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.solTicker as Program<SolTicker>;
  const customAccount = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    try {
      const txSignature = await program.methods
        .initialize()
        .accounts({
          counterAccount: customAccount.publicKey,
          user: provider.wallet.publicKey,
          // 嘗試不同的命名方式
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([customAccount])
        .rpc();

      console.log("Transaction signature:", txSignature);

      const accountData = await program.account.customAccount.fetch(
        customAccount.publicKey
      );

      expect(accountData.count.toNumber()).to.equal(0, "Count should be 0");
      expect(accountData.authority.equals(provider.wallet.publicKey)).to.be.true;
      
      console.log("Test passed! Account initialized successfully.");
      console.log("Count:", accountData.count.toNumber());
      console.log("Authority:", accountData.authority.toBase58());
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  });

  it("Can increment counter", async () => {
    try {
      const txSignature = await program.methods
        .increment()
        .accounts({
          counterAccount: customAccount.publicKey,
          authority: provider.wallet.publicKey,
        })
        .rpc();

      console.log("Increment transaction signature:", txSignature);

      const accountData = await program.account.customAccount.fetch(
        customAccount.publicKey
      );

      expect(accountData.count.toNumber()).to.equal(1, "Count should be 1 after increment");
      
      console.log("Increment test passed!");
      console.log("New count:", accountData.count.toNumber());
    } catch (error) {
      console.error("Increment test failed:", error);
      throw error;
    }
  });


  it("Failed to increment if not authority!", async () => {

    const newCounterAccount = anchor.web3.Keypair.generate();

    await program.methods
      .initialize()
      .accounts({
        counterAccount: newCounterAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([newCounterAccount])
      .rpc();

    const unathorizedUser = anchor.web3.Keypair.generate();

    try {
      await program.methods
        .increment()
        .accounts({
          counterAccount: newCounterAccount.publicKey,
          authority: unathorizedUser.publicKey,
        })
        .signers([unathorizedUser])
        .rpc();

        expect.fail("Should have failed to increment due to unauthorized authority!")
    } catch(error) {
      const err = error as anchor.AnchorError;
      expect(err.error.errorCode.code).to.equal("WrongAuthority");
      expect(err.error.errorCode.number).to.equal(6001);

      const accountData = await program.account.customAccount.fetch(
        newCounterAccount.publicKey
      );
      expect(accountData.count.toNumber()).to.equal(0, "Count should remain 0 after failed increment");
    }
  })
});
