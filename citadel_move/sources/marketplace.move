/// # Citadel Marketplace Contract
/// 
/// This contract handles all commercial logic including license minting,
/// payment processing, royalty distribution, and license upgrades.
/// 
/// ## Key Features:
/// - License purchasing with automatic royalty splits
/// - License upgrading based on XP accumulation
/// - Treasury management for platform fees
/// - Secure payment processing
/// 
module citadel::marketplace {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::object::{Self, Object, ObjectCore};
    use aptos_framework::event;
    use citadel::citadel_registry;

    /// Error codes
    const E_INSUFFICIENT_PAYMENT: u64 = 1;
    const E_AI_MODEL_NOT_ACTIVE: u64 = 2;
    const E_NOT_LICENSE_OWNER: u64 = 3;
    const E_INSUFFICIENT_XP: u64 = 4;
    const E_MAX_LEVEL_REACHED: u64 = 5;
    const E_TREASURY_NOT_INITIALIZED: u64 = 6;

    /// Constants
    const CREATOR_ROYALTY_PERCENTAGE: u64 = 80; // 80% to creator
    const PLATFORM_FEE_PERCENTAGE: u64 = 20;    // 20% to platform
    const BASE_LICENSE_PRICE: u64 = 100000000;  // 1 APT in octas
    const MAX_LEVEL: u64 = 100;
    const XP_PER_LEVEL: u64 = 1000;

    /// License NFT - represents a streamer's license to use an AI model
    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct License has key {
        /// Address of the master AI model this license is based on
        master_ai_address: address,
        /// Current level of the license (starts at 1)
        level: u64,
        /// Experience points accumulated
        xp: u64,
        /// Owner of the license
        owner_address: address,
        /// Timestamp when license was purchased
        purchased_at: u64,
        /// Total hours used with this license
        total_hours_used: u64,
        /// Whether the license is currently active
        is_active: bool,
    }

    /// Treasury resource to hold platform fees
    struct Treasury has key {
        /// Accumulated platform fees
        balance: Coin<AptosCoin>,
        /// Total fees collected
        total_collected: u64,
    }

    /// Events
    #[event]
    struct PurchaseLicenseEvent has drop, store {
        streamer_address: address,
        license_address: address,
        master_ai_address: address,
        payment_amount: u64,
        creator_royalty: u64,
        platform_fee: u64,
        timestamp: u64,
    }

    #[event]
    struct UpgradeLicenseEvent has drop, store {
        streamer_address: address,
        license_address: address,
        old_level: u64,
        new_level: u64,
        upgrade_cost: u64,
        timestamp: u64,
    }

    /// Initialize the treasury (should be called once by admin)
    public entry fun initialize_treasury(admin: &signer) {
        let admin_address = signer::address_of(admin);
        
        // Only allow initialization once
        assert!(!exists<Treasury>(admin_address), E_TREASURY_NOT_INITIALIZED);
        
        move_to(admin, Treasury {
            balance: coin::zero<AptosCoin>(),
            total_collected: 0,
        });
    }

    /// Purchase a license for an AI model
    /// 
    /// @param streamer The account purchasing the license
    /// @param master_ai_address Address of the AI model to license
    /// @param payment Payment coin for the license
    public entry fun purchase_license(
        streamer: &signer,
        master_ai_address: address,
        payment: Coin<AptosCoin>,
    ) acquires Treasury {
        let streamer_address = signer::address_of(streamer);
        
        // Verify AI model is active
        assert!(citadel_registry::is_ai_model_active(master_ai_address), E_AI_MODEL_NOT_ACTIVE);
        
        // Get AI model hourly rate and calculate license price
        let hourly_rate = citadel_registry::get_ai_model_rate(master_ai_address);
        let license_price = calculate_license_price(hourly_rate);
        let payment_amount = coin::value(&payment);
        
        // Verify sufficient payment
        assert!(payment_amount >= license_price, E_INSUFFICIENT_PAYMENT);
        
        // Calculate royalty splits
        let creator_royalty = (license_price * CREATOR_ROYALTY_PERCENTAGE) / 100;
        let platform_fee = license_price - creator_royalty;
        
        // Get creator address
        let creator_address = citadel_registry::get_ai_model_creator(master_ai_address);
        
        // Split payment
        let creator_payment = coin::extract(&mut payment, creator_royalty);
        let platform_payment = coin::extract(&mut payment, platform_fee);
        
        // Transfer royalty to creator
        coin::deposit(creator_address, creator_payment);
        
        // Add platform fee to treasury
        let treasury = borrow_global_mut<Treasury>(@citadel_admin);
        coin::merge(&mut treasury.balance, platform_payment);
        treasury.total_collected = treasury.total_collected + platform_fee;
        
        // Return any excess payment
        if (coin::value(&payment) > 0) {
            coin::deposit(streamer_address, payment);
        } else {
            coin::destroy_zero(payment);
        };
        
        // Create license object
        let constructor_ref = object::create_object(streamer_address);
        let object_signer = object::generate_signer(&constructor_ref);
        let license_address = signer::address_of(&object_signer);
        
        // Initialize license
        move_to(&object_signer, License {
            master_ai_address,
            level: 1,
            xp: 0,
            owner_address: streamer_address,
            purchased_at: aptos_framework::timestamp::now_seconds(),
            total_hours_used: 0,
            is_active: true,
        });
        
        // Transfer license to streamer
        let license_object = object::object_from_constructor_ref<License>(&constructor_ref);
        object::transfer(streamer, license_object, streamer_address);
        
        // Emit event
        event::emit(PurchaseLicenseEvent {
            streamer_address,
            license_address,
            master_ai_address,
            payment_amount: license_price,
            creator_royalty,
            platform_fee,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    /// Upgrade a license to the next level
    /// 
    /// @param streamer The license owner
    /// @param license_address Address of the license to upgrade
    /// @param payment Payment for the upgrade
    public entry fun upgrade_license(
        streamer: &signer,
        license_address: address,
        payment: Coin<AptosCoin>,
    ) acquires License, Treasury {
        let streamer_address = signer::address_of(streamer);
        
        // Verify license ownership
        let license = borrow_global_mut<License>(license_address);
        assert!(license.owner_address == streamer_address, E_NOT_LICENSE_OWNER);
        
        // Check if license can be upgraded
        assert!(license.level < MAX_LEVEL, E_MAX_LEVEL_REACHED);
        
        let required_xp = calculate_required_xp(license.level);
        assert!(license.xp >= required_xp, E_INSUFFICIENT_XP);
        
        // Calculate upgrade cost
        let upgrade_cost = calculate_upgrade_cost(license.level);
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= upgrade_cost, E_INSUFFICIENT_PAYMENT);
        
        // Process payment (split between creator and platform)
        let creator_royalty = (upgrade_cost * CREATOR_ROYALTY_PERCENTAGE) / 100;
        let platform_fee = upgrade_cost - creator_royalty;
        
        let creator_address = citadel_registry::get_ai_model_creator(license.master_ai_address);
        
        // Split payment
        let creator_payment = coin::extract(&mut payment, creator_royalty);
        let platform_payment = coin::extract(&mut payment, platform_fee);
        
        // Transfer payments
        coin::deposit(creator_address, creator_payment);
        
        let treasury = borrow_global_mut<Treasury>(@citadel_admin);
        coin::merge(&mut treasury.balance, platform_payment);
        treasury.total_collected = treasury.total_collected + platform_fee;
        
        // Return excess payment
        if (coin::value(&payment) > 0) {
            coin::deposit(streamer_address, payment);
        } else {
            coin::destroy_zero(payment);
        };
        
        // Upgrade license
        let old_level = license.level;
        license.level = license.level + 1;
        license.xp = license.xp - required_xp; // Carry over excess XP
        
        // Emit event
        event::emit(UpgradeLicenseEvent {
            streamer_address,
            license_address,
            old_level,
            new_level: license.level,
            upgrade_cost,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    /// Add XP to a license (called by usage contract)
    public fun add_xp_to_license(
        license_address: address,
        xp_amount: u64,
    ) acquires License {
        let license = borrow_global_mut<License>(license_address);
        license.xp = license.xp + xp_amount;
    }

    /// Record usage hours for a license (called by usage contract)
    public fun record_license_usage(
        license_address: address,
        hours: u64,
    ) acquires License {
        let license = borrow_global_mut<License>(license_address);
        license.total_hours_used = license.total_hours_used + hours;
    }

    /// Withdraw platform fees (admin only)
    public entry fun withdraw_platform_fees(
        admin: &signer,
        amount: u64,
    ) acquires Treasury {
        let admin_address = signer::address_of(admin);
        assert!(admin_address == @citadel_admin, E_NOT_LICENSE_OWNER);
        
        let treasury = borrow_global_mut<Treasury>(admin_address);
        let withdrawal = coin::extract(&mut treasury.balance, amount);
        coin::deposit(admin_address, withdrawal);
    }

    // === Helper Functions ===

    /// Calculate license price based on AI model's hourly rate
    fun calculate_license_price(hourly_rate: u64): u64 {
        // License costs 24 hours worth of usage
        hourly_rate * 24
    }

    /// Calculate required XP for next level
    fun calculate_required_xp(current_level: u64): u64 {
        XP_PER_LEVEL * current_level
    }

    /// Calculate upgrade cost based on current level
    fun calculate_upgrade_cost(current_level: u64): u64 {
        // Upgrade cost increases with level
        BASE_LICENSE_PRICE * (current_level + 1) / 2
    }

    // === View Functions ===

    /// Get license information
    #[view]
    public fun get_license_info(license_address: address): (address, u64, u64, address, u64, u64, bool) acquires License {
        let license = borrow_global<License>(license_address);
        (
            license.master_ai_address,
            license.level,
            license.xp,
            license.owner_address,
            license.purchased_at,
            license.total_hours_used,
            license.is_active
        )
    }

    /// Check if license can be upgraded
    #[view]
    public fun can_upgrade_license(license_address: address): bool acquires License {
        if (!exists<License>(license_address)) {
            return false
        };
        
        let license = borrow_global<License>(license_address);
        if (license.level >= MAX_LEVEL) {
            return false
        };
        
        let required_xp = calculate_required_xp(license.level);
        license.xp >= required_xp
    }

    /// Get upgrade cost for a license
    #[view]
    public fun get_upgrade_cost(license_address: address): u64 acquires License {
        let license = borrow_global<License>(license_address);
        calculate_upgrade_cost(license.level)
    }

    /// Get treasury balance
    #[view]
    public fun get_treasury_balance(): u64 acquires Treasury {
        let treasury = borrow_global<Treasury>(@citadel_admin);
        coin::value(&treasury.balance)
    }

    /// Check if user owns a license for specific AI model
    #[view]
    public fun has_license_for_ai(user_address: address, ai_model_address: address): bool {
        // This would require iterating through user's objects
        // For now, return false - implementation would depend on indexing
        false
    }
}
