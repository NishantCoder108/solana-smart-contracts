# 🎯 Solana Staking Smart Contract

A decentralized token staking protocol built on Solana that enables users to stake tokens and earn points based on staking duration and amount, with flexible unstaking options.

## 🎯 Overview

The Staking program allows users to deposit tokens into a staking pool and earn points over time. Pool administrators can create staking pools with customizable reward rates, and users can stake, claim points, and unstake their tokens at any time. Points are calculated automatically based on the amount staked and the duration of the stake.

## 📊 Program Details

- **Program ID**: `2t4tTkX9nEKuTHdZbVYYXwq188GBQQq35fh46xV1qBuw`
- **IDL Account**: `AEgW9ghjVXPqpuSyxqrBkgb1YgFBpFVMHBJTzaPPzAwT`
- **Deployed Signature**: `4xdPVCreD4LWnG1udpucTuTRiSZ1hECfdaswUakntyBvbEDbNNhFxBSLABiZjXZKMCgAyRCJhtpPCnAMjJfeTgKN`
- **Security Metadata**: `Db6CCPJiWuWkXFpRrRLnz45npgKoM4ZrAFB9xjomVUhv`

- **Framework**: Anchor 0.32.1
- **Language**: Rust
- **Blockchain**: Solana
- **Token Standard**: SPL Token (Token-2022 compatible)

## 👥 User Stories

### 💰 As a Token Holder

**Scenario: Earn Rewards by Staking**

- **Given** I have 10,000 USDC tokens that I want to stake
- **When** I deposit my tokens into the staking pool
- **Then** my tokens are securely locked in the pool vault
- **And** I start earning points automatically based on the reward rate
- **And** I can check my accumulated points at any time

### 📈 As a Long-Term Staker

**Scenario: Claim Accumulated Points**

- **Given** I've been staking 5,000 USDC for 30 days
- **When** I claim my points
- **Then** all earned points since my last claim are added to my balance
- **And** my last claim timestamp is updated
- **And** I continue earning points on my remaining stake

### 🔄 As a Flexible Investor

**Scenario: Partial Unstaking**

- **Given** I have 10,000 USDC staked
- **When** I unstake 3,000 USDC
- **Then** my tokens are returned to my wallet
- **And** my remaining stake continues earning points
- **And** my points are proportionally adjusted based on the unstaked amount

### 🏁 As a Complete Exiter

**Scenario: Unstake All Tokens**

- **Given** I want to withdraw all my staked tokens
- **When** I call the unstake_all instruction
- **Then** all my tokens are returned to my wallet
- **And** my user stake account is closed
- **And** all remaining points are calculated and stored

### 👨‍💼 As a Pool Administrator

**Scenario: Create Staking Pool**

- **Given** I want to create a new staking pool for USDC
- **When** I initialize the pool with a reward rate
- **Then** a new pool PDA is created
- **And** a vault account is set up to hold staked tokens
- **And** users can start staking immediately

## 🏗️ Architecture

### Core Components

#### **Pool Account (PDA)**

- **Purpose**: Stores pool configuration and global staking statistics
- **Seeds**: `["pool", authority_pubkey]`
- **Data**:
  - `authority`: Public key of the pool creator/administrator
  - `mint`: Token mint address (e.g., USDC)
  - `vault`: Associated token account address for the pool vault
  - `bump`: PDA bump seed
  - `reward_rate`: Points earned per token per day
  - `total_staked`: Total amount of tokens staked by all users

#### **UserStake Account (PDA)**

- **Purpose**: Tracks individual user's staking position and points
- **Seeds**: `["user-stake", user_pubkey, pool_pubkey]`
- **Data**:
  - `user`: Public key of the staker
  - `amount`: Total amount of tokens currently staked
  - `staked_at`: Timestamp when user first staked
  - `last_claim`: Timestamp of last point claim
  - `points`: Accumulated points earned so far
  - `user_vault_ata`: User's associated token account address
  - `bump`: PDA bump seed

#### **Pool Vault (ATA)**

- **Purpose**: Securely holds all staked tokens from users
- **Authority**: Pool PDA (program-controlled)
- **Token Mint**: Same as the pool's token mint

### Program Instructions

#### **1. Initialize Pool** 🏊

Creates a new staking pool with a specified token mint and reward rate.

**Parameters:** None (reads from accounts)

**Actions:**

- Creates pool PDA account
- Creates pool vault ATA for token storage
- Initializes pool state with default reward rate (1 point per token per day)
- Validates authority has sufficient SOL balance

#### **2. Stake** 💎

Deposits tokens into the staking pool and starts earning points.

**Parameters:**

- `amount` (u64): Amount of tokens to stake

**Actions:**

- Creates user stake PDA if first time staking
- Calculates and adds points earned since last interaction
- Transfers user's tokens to pool vault
- Updates user stake amount and pool total staked

#### **3. Get Points** 📊

Returns the current total points for a user (read-only, no state changes).

**Parameters:** None

**Actions:**

- Calculates points earned since last claim
- Returns total points (stored + newly earned)
- Does not modify any account state

#### **4. Claim Points** ✅

Updates the user's point balance by calculating earned points since last claim.

**Parameters:** None

**Actions:**

- Calculates points earned since last claim
- Adds earned points to user's point balance
- Updates last_claim timestamp

#### **5. Unstake** 🔓

Withdraws a partial amount of staked tokens.

**Parameters:**

- `amount` (u64): Amount of tokens to unstake

**Actions:**

- Calculates points earned since last claim
- Proportionally reduces points based on unstaked amount
- Transfers tokens from pool vault back to user
- Updates user stake amount and pool total staked

#### **6. Unstake All** 🚪

Withdraws all staked tokens and closes the user stake account.

**Parameters:** None

**Actions:**

- Calculates final points earned
- Transfers all tokens from pool vault back to user
- Closes user stake PDA account
- Resets user stake state
- Updates pool total staked

## 🔧 Technical Implementation

### Points Calculation Formula

Points are calculated based on:

- **Staking Duration**: Time elapsed since last claim (in days)
- **Staked Amount**: Amount of tokens currently staked
- **Reward Rate**: Points per token per day (configured in pool)

```rust
earned_points = (elapsed_seconds / 86400) * staked_amount * reward_rate
```

### Security Features

- **Program-Derived Addresses (PDAs)**: Deterministic, program-controlled accounts for pools and user stakes
- **Authority Checks**: Only authorized parties can perform actions
- **Atomic Transactions**: All operations succeed or fail together
- **Token Interface**: Compatible with all SPL tokens (Token-2022 compatible)
- **Proportional Point Reduction**: When unstaking, points are reduced proportionally to maintain fairness

### Error Handling

```rust
#[error_code]
pub enum StakingError {
    #[msg("User does not have enough stake to unstake this amount")]
    InsufficientStake,

    #[msg("Creator does not have enough sol for initialize the pool")]
    InsufficientSolBalance,

    #[msg("Invalid authority")]
    InvalidAuthority,

    #[msg("Invalid mint address")]
    InvalidMint,

    #[msg("Insufficient token balance")]
    InsufficientTokenBalance,

    #[msg("Invalid staking amount")]
    InvalidStakingAmount,

    #[msg("Invalid unstaking amount")]
    InvalidUnStakingAmount,
}
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Yarn package manager
- Solana CLI tools
- Rust toolchain

### Installation

```bash
# Clone the repository
git clone https://github.com/sol-warrior/solana-smart-contracts
cd solana-smart-contracts/staking

# Install dependencies
yarn install

# Build the program
anchor build

# Run tests
anchor test
```

### Deployment

```bash
# Deploy to localnet
anchor deploy

# Deploy to devnet/mainnet
anchor deploy --provider.cluster devnet
```

## 📋 Usage Examples

### Initializing a Staking Pool

```typescript
// Example: Create a new USDC staking pool
await program.methods
  .initializePool()
  .accounts({
    authority: poolCreator.publicKey,
    pool: poolPda,
    mint: usdcMint,
    poolVault: poolVaultAta,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Staking Tokens

```typescript
// Example: Stake 5,000 USDC (6 decimals)
const stakeAmount = new anchor.BN(5000 * 10 ** 6);

await program.methods
  .stake(stakeAmount)
  .accounts({
    user: staker.publicKey,
    authority: poolCreator.publicKey,
    pool: poolPda,
    mint: usdcMint,
    poolVault: poolVaultAta,
    userStake: userStakePda,
    userAta: userAta,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Getting Points (Read-Only)

```typescript
// Example: Check current points without claiming
const points = await program.methods
  .getPoints()
  .accounts({
    user: staker.publicKey,
    pool: poolPda,
    userStake: userStakePda,
  })
  .view();

console.log(`Current points: ${points}`);
```

### Claiming Points

```typescript
// Example: Claim accumulated points
await program.methods
  .claimPoints()
  .accounts({
    user: staker.publicKey,
    pool: poolPda,
    userStake: userStakePda,
  })
  .rpc();
```

### Partial Unstaking

```typescript
// Example: Unstake 3,000 USDC
const unstakeAmount = new anchor.BN(3000 * 10 ** 6);

await program.methods
  .unstake(unstakeAmount)
  .accounts({
    user: staker.publicKey,
    authority: poolCreator.publicKey,
    pool: poolPda,
    mint: usdcMint,
    poolVault: poolVaultAta,
    userStake: userStakePda,
    userAta: userAta,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Unstaking All Tokens

```typescript
// Example: Withdraw all staked tokens
await program.methods
  .unstakeAll()
  .accounts({
    user: staker.publicKey,
    authority: poolCreator.publicKey,
    pool: poolPda,
    mint: usdcMint,
    poolVault: poolVaultAta,
    userStake: userStakePda,
    userAta: userAta,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

## 🧪 Testing

The project includes comprehensive tests using `LiteSVM` for fast, local testing:

```bash
# Run all tests
yarn test

# Run specific test suite
yarn ts-mocha tests/litesvm.test.ts
```

**Test Coverage:**

- ✅ Pool initialization and configuration
- ✅ Token staking and vault management
- ✅ Points calculation and accumulation
- ✅ Point claiming functionality
- ✅ Partial unstaking with proportional point reduction
- ✅ Complete unstaking and account closure
- ✅ Account validation and security checks
- ✅ Time-based point calculation accuracy

## 🔐 Security Considerations

1. **Access Control**: Only authorized users can execute specific instructions
2. **Amount Validation**: Prevents zero-amount and invalid staking/unstaking operations
3. **PDA Security**: Program-derived addresses prevent unauthorized access
4. **Atomic Operations**: All token transfers happen in single transactions
5. **Account Validation**: Comprehensive checks on all account relationships
6. **Proportional Point Reduction**: Ensures fair point distribution when partially unstaking
7. **Time-Based Calculations**: Points are calculated based on actual elapsed time

## 💡 Key Features

- **Flexible Staking**: Stake any amount at any time
- **Automatic Point Calculation**: Points accumulate automatically based on staking duration
- **Partial Unstaking**: Withdraw any portion of your stake while keeping the rest earning points
- **Point Claiming**: Manually update your point balance to reflect earned rewards
- **Account Closure**: Complete unstaking automatically closes user accounts to save rent
- **Token-2022 Compatible**: Works with both standard SPL tokens and Token-2022

## 🤝 Contributing

Contributions are welcome and appreciated.

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

---

## 📄 License

This project is licensed under the **ISC License**, a permissive open-source license similar to MIT.

See the [LICENSE](LICENSE) file for full details.

---

## 📞 Support

If you have questions or issues:

- Open an issue on GitHub
- Review the test files for usage examples
- Refer to the Anchor documentation for Solana development

---

## 🌐 Connect with Me

- GitHub: https://github.com/sol-warrior
- X (Twitter): https://x.com/warriorofsol

Built with ❤️ using **Anchor Framework** on **Solana**.
