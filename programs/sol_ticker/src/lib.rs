use anchor_lang::prelude::*;

declare_id!("H1VFLjruChbrrLsCyXPSp9erTAj9V2Hf6X7pnSMsWVYt");

#[program]
pub mod sol_ticker {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
