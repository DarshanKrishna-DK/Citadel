# Citadel Smart Contracts

This directory contains the complete set of Move smart contracts for the Citadel AI moderator marketplace built on the Aptos blockchain.

## Architecture Overview

The Citadel smart contract system is designed with a modular architecture consisting of four main contracts:

### 1. Registry Contract (`citadel_registry.move`)
**Purpose**: Foundational layer for creating and managing core assets

**Key Features**:
- Creator profile registration and management
- AI Model minting as NFT objects
- Metadata management and validation
- Event emission for tracking activities

**Main Functions**:
- `register_creator()` - Register as an AI creator
- `mint_ai_model()` - Mint new AI model NFTs
- `update_ai_model_status()` - Enable/disable AI models
- `update_hourly_rate()` - Update pricing

### 2. Marketplace Contract (`marketplace.move`)
**Purpose**: Commercial logic including licensing, payments, and upgrades

**Key Features**:
- License purchasing with automatic royalty splits (80% creator, 20% platform)
- License upgrading based on XP accumulation
- Treasury management for platform fees
- Secure payment processing with AptosCoin

**Main Functions**:
- `purchase_license()` - Buy license for an AI model
- `upgrade_license()` - Upgrade license level with XP
- `initialize_treasury()` - Set up platform treasury
- `withdraw_platform_fees()` - Admin fee withdrawal

### 3. Usage & Billing Contract (`usage_escrow.move`)
**Purpose**: Pay-as-you-go billing system with escrow mechanics

**Key Features**:
- User balance management (deposit/withdraw)
- Session-based billing with oracle verification
- Automatic payment processing and royalty distribution
- Integration with reputation tracking

**Main Functions**:
- `deposit()` - Add funds to user balance
- `withdraw()` - Withdraw unused funds
- `start_session()` - Begin AI usage session
- `end_session()` - End session and process payment (oracle only)

### 4. Reputation Contract (`reputation.move`)
**Purpose**: On-chain social layer with upvotes and usage statistics

**Key Features**:
- Upvoting system with license verification
- Usage statistics tracking
- Dynamic reputation score calculation
- Anti-spam protection (one upvote per user per AI)

**Main Functions**:
- `upvote()` - Upvote an AI model (requires license)
- `record_usage_stats_internal()` - Update usage statistics
- `remove_upvote()` - Admin function for abuse prevention

## Contract Interactions

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Registry      │    │   Marketplace   │    │ Usage & Billing │
│                 │    │                 │    │                 │
│ • Creator Reg   │───▶│ • License Buy   │───▶│ • Session Start │
│ • AI Model Mint │    │ • Upgrades      │    │ • Pay-as-you-go │
│ • Metadata      │    │ • Royalties     │    │ • Oracle End    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │   Reputation    │
                    │                 │
                    │ • Upvotes       │
                    │ • Usage Stats   │
                    │ • Reputation    │
                    └─────────────────┘
```

## Key Design Decisions

### 1. **Aptos Objects**
- All major entities (CreatorProfile, AIModel, License, ActiveSession) are implemented as Aptos Objects
- Provides better composability and ownership management
- Enables efficient transfers and object-based permissions

### 2. **Royalty System**
- 80% of all payments go to AI model creators
- 20% goes to platform treasury
- Automatic splits on every transaction

### 3. **XP and Leveling**
- Licenses gain XP through usage (10 XP per hour)
- Level upgrades require accumulated XP and payment
- Higher levels unlock better features (implementation dependent)

### 4. **Oracle-based Billing**
- Trusted oracle account manages session endings
- Prevents manipulation of usage duration
- Enables integration with off-chain monitoring systems

### 5. **Reputation Scoring**
- Multi-factor reputation calculation:
  - Base score: 100 points
  - Upvotes: +1 point each (max 200)
  - Usage hours: +1 point per 10 hours (max 300)
  - Session consistency bonuses: up to 50 points
  - Maximum score: 1000 points

## Deployment Instructions

1. **Initialize Aptos CLI**:
   ```bash
   aptos init --profile citadel
   ```

2. **Compile Contracts**:
   ```bash
   cd citadel_move
   aptos move compile
   ```

3. **Deploy to Testnet**:
   ```bash
   aptos move publish --profile citadel
   ```

4. **Initialize System**:
   ```bash
   # Initialize treasury
   aptos move run --function-id 'citadel::marketplace::initialize_treasury'
   
   # Initialize oracle
   aptos move run --function-id 'citadel::usage_escrow::initialize_oracle' --args address:ORACLE_ADDRESS
   ```

## Security Considerations

### 1. **Access Control**
- Admin functions protected by `@citadel_admin` address check
- Oracle functions restricted to configured oracle address
- License ownership verified before operations

### 2. **Payment Security**
- All payments use Aptos native coin handling
- Automatic royalty splits prevent manipulation
- Escrow system protects user funds

### 3. **Anti-Spam Measures**
- One upvote per user per AI model
- License ownership required for upvoting
- Oracle verification for session billing

### 4. **Upgrade Safety**
- XP requirements prevent premature upgrades
- Payment verification before level increases
- State consistency maintained across operations

## Integration with Frontend

The contracts are designed to integrate seamlessly with the Citadel frontend:

1. **Creator Flow**: Register → Mint AI Models → Earn from licenses
2. **Streamer Flow**: Purchase Licenses → Use AI → Gain XP → Upgrade
3. **Usage Flow**: Deposit funds → Start sessions → Automatic billing
4. **Social Flow**: Upvote AI models → Build reputation → Discover top performers

## Testing

For comprehensive testing, implement the following test scenarios:

1. **Registry Tests**: Creator registration, AI model minting, metadata updates
2. **Marketplace Tests**: License purchasing, upgrades, payment flows
3. **Billing Tests**: Deposits, withdrawals, session management, oracle operations
4. **Reputation Tests**: Upvoting, usage tracking, score calculations
5. **Integration Tests**: End-to-end user journeys, cross-contract interactions

## Future Enhancements

Potential improvements for future versions:

1. **Governance**: DAO-based parameter updates and fee adjustments
2. **Staking**: Stake APT for enhanced reputation or reduced fees
3. **NFT Marketplace**: Secondary market for license trading
4. **Analytics**: On-chain analytics and performance metrics
5. **Multi-token Support**: Support for other Aptos ecosystem tokens

## Support

For questions or issues with the smart contracts, please refer to the main Citadel documentation or contact the development team.
