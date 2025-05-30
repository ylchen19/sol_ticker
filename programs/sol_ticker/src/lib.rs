use anchor_lang::prelude::*;

declare_id!("H1VFLjruChbrrLsCyXPSp9erTAj9V2Hf6X7pnSMsWVYt");
#[account]
pub struct CustomAccount {
    pub count: u64,
    pub authority: Pubkey,
}

#[program] //所有合約的入口點
pub mod sol_ticker {
    use super::*;
     //all instructions here
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter_account = &mut ctx.accounts.counter_account;
        counter_account.count = 0;
        counter_account.authority = ctx.accounts.user.key();
        msg!("Counter account created!");
        msg!("Current count: {}", counter_account.count);
        msg!("Authority: {}", counter_account.authority);
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter_account = &mut ctx.accounts.counter_account;
        let authority_signer = &ctx.accounts.authority;

        //檢查 authority 是否匹配
        if counter_account.authority != authority_signer.key() {
            return err!(ErrorCode::WrongAuthority);
        }

        //增加計數器
        counter_account.count += 1;
        msg!("Counter incremented!");
        msg!("Current count: {}", counter_account.count);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Increment<'info> {

    #[account(mut)]
    pub counter_account: Account<'info, CustomAccount>,
    //執行 increment 操作的用戶，他必須是計數器帳戶中記錄的 authority
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    
    #[account(
        init, //創建帳戶
        payer = user,
        space = 8 + 8 + 32, // 8 bytes for u64 count, 32 bytes for Pubkey owner
    )]
    pub counter_account: Account<'info, CustomAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action.")] // 錯誤發生時顯示的訊息
    Unauthorized, // 錯誤的名稱

    #[msg("Cannot increment counter_account.authority does not match signer")]
    WrongAuthority, //（或者你可以選擇更詳細的錯誤訊息）
}
