/// # Citadel Usage & Billing Contract
/// 
/// This contract manages the on-chain, pay-as-you-go billing system
/// in a trustless manner using escrow mechanics.
/// 
/// ## Key Features:
/// - User balance management with deposits and withdrawals
/// - Session-based billing with oracle verification
/// - Automatic payment processing and royalty distribution
/// - Integration with reputation tracking
/// 
module citadel::usage_escrow {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::object::{Self, Object, ObjectCore};
    use aptos_framework::event;
    use citadel::citadel_registry;
    use citadel::marketplace;
    use citadel::reputation;

    /// Error codes
    const E_INSUFFICIENT_BALANCE: u64 = 1;
    const E_SESSION_NOT_FOUND: u64 = 2;
    const E_NOT_ORACLE: u64 = 3;
    const E_SESSION_ALREADY_ACTIVE: u64 = 4;
    const E_INVALID_LICENSE: u64 = 5;
    const E_ORACLE_NOT_INITIALIZED: u64 = 6;
    const E_BALANCE_NOT_FOUND: u64 = 7;

    /// Constants
    const CREATOR_ROYALTY_PERCENTAGE: u64 = 80; // 80% to creator
    const PLATFORM_FEE_PERCENTAGE: u64 = 20;    // 20% to platform
    const XP_PER_HOUR: u64 = 10; // XP gained per hour of usage

    /// User's balance resource for holding deposited APT
    struct UserBalance has key, store {
        /// Deposited APT coins
        balance: Coin<AptosCoin>,
        /// Total amount ever deposited
        total_deposited: u64,
        /// Total amount spent on sessions
        total_spent: u64,
    }

    /// Active session resource tracking ongoing usage
    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct ActiveSession has key {
        /// License being used in this session
        license_address: address,
        /// Streamer using the license
        streamer_address: address,
        /// AI model being used
        ai_model_address: address,
        /// Session start timestamp
        start_time: u64,
        /// Hourly rate for this session (cached for consistency)
        hourly_rate: u64,
    }

    /// Oracle configuration resource
    struct Oracle has key {
        /// Address of the trusted oracle account
        oracle_address: address,
        /// Total sessions processed
        total_sessions: u64,
    }

    /// Events
    #[event]
    struct DepositEvent has drop, store {
        user_address: address,
        amount: u64,
        new_balance: u64,
        timestamp: u64,
    }

    #[event]
    struct WithdrawEvent has drop, store {
        user_address: address,
        amount: u64,
        remaining_balance: u64,
        timestamp: u64,
    }

    #[event]
    struct SessionStartEvent has drop, store {
        session_id: address,
        streamer_address: address,
        license_address: address,
        ai_model_address: address,
        hourly_rate: u64,
        timestamp: u64,
    }

    #[event]
    struct SessionEndEvent has drop, store {
        session_id: address,
        streamer_address: address,
        duration_seconds: u64,
        total_cost: u64,
        creator_payment: u64,
        platform_fee: u64,
        xp_gained: u64,
        timestamp: u64,
    }

    /// Initialize oracle (admin only)
    public entry fun initialize_oracle(
        admin: &signer,
        oracle_address: address,
    ) {
        let admin_address = signer::address_of(admin);
        assert!(admin_address == @citadel_admin, E_NOT_ORACLE);
        
        move_to(admin, Oracle {
            oracle_address,
            total_sessions: 0,
        });
    }

    /// Deposit APT into user's balance
    /// 
    /// @param streamer The user depositing funds
    /// @param amount Coin to deposit
    public entry fun deposit(
        streamer: &signer,
        amount: Coin<AptosCoin>,
    ) acquires UserBalance {
        let streamer_address = signer::address_of(streamer);
        let deposit_amount = coin::value(&amount);
        
        // Initialize balance if it doesn't exist
        if (!exists<UserBalance>(streamer_address)) {
            move_to(streamer, UserBalance {
                balance: coin::zero<AptosCoin>(),
                total_deposited: 0,
                total_spent: 0,
            });
        };
        
        // Add to balance
        let user_balance = borrow_global_mut<UserBalance>(streamer_address);
        coin::merge(&mut user_balance.balance, amount);
        user_balance.total_deposited = user_balance.total_deposited + deposit_amount;
        
        let new_balance = coin::value(&user_balance.balance);
        
        // Emit event
        event::emit(DepositEvent {
            user_address: streamer_address,
            amount: deposit_amount,
            new_balance,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    /// Withdraw unused APT from user's balance
    /// 
    /// @param streamer The user withdrawing funds
    /// @param amount Amount to withdraw in octas
    public entry fun withdraw(
        streamer: &signer,
        amount: u64,
    ) acquires UserBalance {
        let streamer_address = signer::address_of(streamer);
        
        // Verify balance exists and has sufficient funds
        assert!(exists<UserBalance>(streamer_address), E_BALANCE_NOT_FOUND);
        let user_balance = borrow_global_mut<UserBalance>(streamer_address);
        assert!(coin::value(&user_balance.balance) >= amount, E_INSUFFICIENT_BALANCE);
        
        // Extract and transfer coins
        let withdrawal = coin::extract(&mut user_balance.balance, amount);
        coin::deposit(streamer_address, withdrawal);
        
        let remaining_balance = coin::value(&user_balance.balance);
        
        // Emit event
        event::emit(WithdrawEvent {
            user_address: streamer_address,
            amount,
            remaining_balance,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    /// Start a new usage session
    /// 
    /// @param streamer The streamer starting the session
    /// @param license_address Address of the license to use
    public entry fun start_session(
        streamer: &signer,
        license_address: address,
    ) acquires UserBalance {
        let streamer_address = signer::address_of(streamer);
        
        // Verify user has sufficient balance
        assert!(exists<UserBalance>(streamer_address), E_BALANCE_NOT_FOUND);
        let user_balance = borrow_global<UserBalance>(streamer_address);
        assert!(coin::value(&user_balance.balance) > 0, E_INSUFFICIENT_BALANCE);
        
        // Get license info and verify ownership
        let (ai_model_address, _, _, owner_address, _, _, is_active) = marketplace::get_license_info(license_address);
        assert!(owner_address == streamer_address, E_INVALID_LICENSE);
        assert!(is_active, E_INVALID_LICENSE);
        
        // Verify AI model is active
        assert!(citadel_registry::is_ai_model_active(ai_model_address), E_INVALID_LICENSE);
        
        // Get hourly rate
        let hourly_rate = citadel_registry::get_ai_model_rate(ai_model_address);
        
        // Create session object
        let constructor_ref = object::create_object(streamer_address);
        let object_signer = object::generate_signer(&constructor_ref);
        let session_id = signer::address_of(&object_signer);
        
        // Initialize session
        move_to(&object_signer, ActiveSession {
            license_address,
            streamer_address,
            ai_model_address,
            start_time: aptos_framework::timestamp::now_seconds(),
            hourly_rate,
        });
        
        // Transfer session object to streamer
        let session_object = object::object_from_constructor_ref<ActiveSession>(&constructor_ref);
        object::transfer(streamer, session_object, streamer_address);
        
        // Emit event
        event::emit(SessionStartEvent {
            session_id,
            streamer_address,
            license_address,
            ai_model_address,
            hourly_rate,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    /// End a usage session (oracle only)
    /// 
    /// @param oracle The trusted oracle account
    /// @param session_id Address of the session to end
    /// @param duration_seconds Duration of the session in seconds
    public entry fun end_session(
        oracle: &signer,
        session_id: address,
        duration_seconds: u64,
    ) acquires Oracle, ActiveSession, UserBalance {
        let oracle_address = signer::address_of(oracle);
        
        // Verify oracle authorization
        let oracle_config = borrow_global_mut<Oracle>(@citadel_admin);
        assert!(oracle_address == oracle_config.oracle_address, E_NOT_ORACLE);
        
        // Get session info
        assert!(exists<ActiveSession>(session_id), E_SESSION_NOT_FOUND);
        let session = move_from<ActiveSession>(session_id);
        
        // Calculate cost (duration in hours * hourly rate)
        let duration_hours = (duration_seconds + 3599) / 3600; // Round up to nearest hour
        let total_cost = duration_hours * session.hourly_rate;
        
        // Calculate payments
        let creator_payment = (total_cost * CREATOR_ROYALTY_PERCENTAGE) / 100;
        let platform_fee = total_cost - creator_payment;
        
        // Process payment from user balance
        let user_balance = borrow_global_mut<UserBalance>(session.streamer_address);
        assert!(coin::value(&user_balance.balance) >= total_cost, E_INSUFFICIENT_BALANCE);
        
        // Extract payment
        let payment = coin::extract(&mut user_balance.balance, total_cost);
        user_balance.total_spent = user_balance.total_spent + total_cost;
        
        // Split payment
        let creator_coin = coin::extract(&mut payment, creator_payment);
        let platform_coin = payment; // Remaining amount
        
        // Get creator address and send payment
        let creator_address = citadel_registry::get_ai_model_creator(session.ai_model_address);
        coin::deposit(creator_address, creator_coin);
        coin::deposit(@citadel_admin, platform_coin);
        
        // Calculate and add XP to license
        let xp_gained = duration_hours * XP_PER_HOUR;
        marketplace::add_xp_to_license(session.license_address, xp_gained);
        
        // Record usage hours in license
        marketplace::record_license_usage(session.license_address, duration_hours);
        
        // Update reputation stats
        reputation::record_usage_stats_internal(session.ai_model_address, duration_hours);
        
        // Update oracle stats
        oracle_config.total_sessions = oracle_config.total_sessions + 1;
        
        // Emit event
        event::emit(SessionEndEvent {
            session_id,
            streamer_address: session.streamer_address,
            duration_seconds,
            total_cost,
            creator_payment,
            platform_fee,
            xp_gained,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    // === View Functions ===

    /// Get user balance information
    #[view]
    public fun get_user_balance(user_address: address): (u64, u64, u64) acquires UserBalance {
        if (!exists<UserBalance>(user_address)) {
            return (0, 0, 0)
        };
        
        let balance = borrow_global<UserBalance>(user_address);
        (
            coin::value(&balance.balance),
            balance.total_deposited,
            balance.total_spent
        )
    }

    /// Get active session information
    #[view]
    public fun get_session_info(session_id: address): (address, address, address, u64, u64) acquires ActiveSession {
        let session = borrow_global<ActiveSession>(session_id);
        (
            session.license_address,
            session.streamer_address,
            session.ai_model_address,
            session.start_time,
            session.hourly_rate
        )
    }

    /// Check if user has active session
    #[view]
    public fun has_active_session(session_id: address): bool {
        exists<ActiveSession>(session_id)
    }

    /// Get oracle information
    #[view]
    public fun get_oracle_info(): (address, u64) acquires Oracle {
        let oracle = borrow_global<Oracle>(@citadel_admin);
        (oracle.oracle_address, oracle.total_sessions)
    }

    /// Calculate session cost estimate
    #[view]
    public fun estimate_session_cost(ai_model_address: address, duration_hours: u64): u64 {
        let hourly_rate = citadel_registry::get_ai_model_rate(ai_model_address);
        duration_hours * hourly_rate
    }
}
