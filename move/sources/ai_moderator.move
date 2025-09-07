module citadel::ai_moderator {
    use std::signer;
    use std::string::{Self, String};
    use std::option;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::timestamp;
    use aptos_token_objects::collection;
    use aptos_token_objects::token;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INVALID_MODERATOR: u64 = 2;
    const E_INVALID_LICENSE: u64 = 3;
    const E_SESSION_ALREADY_ACTIVE: u64 = 4;
    const E_NO_ACTIVE_SESSION: u64 = 5;
    const E_INSUFFICIENT_PAYMENT: u64 = 6;

    /// AI Moderator Master NFT
    struct AIModerator has key {
        creator: address,
        name: String,
        description: String,
        personality: String,
        hourly_price: u64,
        monthly_price: u64,
        buyout_price: u64,
        created_at: u64,
        total_licenses_sold: u64,
        revenue_earned: u64,
        upvotes: u64,
    }

    /// License NFT for using an AI Moderator
    struct License has key {
        moderator_address: address,
        owner: address,
        level: u8,
        is_upgraded: bool,
        purchased_at: u64,
        upgrade_data: String,
    }

    /// Active deployment session
    struct DeploymentSession has key {
        license_address: address,
        streamer: address,
        platform: String,
        start_time: u64,
        end_time: u64,
        is_active: bool,
    }

    /// Collection for AI Moderators
    struct ModeratorCollection has key {
        collection_object: Object<collection::Collection>,
    }

    /// Initialize the module
    fun init_module(account: &signer) {
        let collection_constructor_ref = collection::create_unlimited_collection(
            account,
            string::utf8(b"Citadel AI Moderators Collection"),
            string::utf8(b"A collection of AI moderators for content moderation"),
            option::none(),
            string::utf8(b"https://citadel.ai")
        );
        
        let collection_object = object::object_from_constructor_ref(&collection_constructor_ref);
        
        move_to(account, ModeratorCollection {
            collection_object,
        });
    }

    /// Mint a new AI Moderator (Creator function)
    public entry fun mint_ai_moderator(
        creator: &signer,
        name: String,
        description: String,
        personality: String,
        hourly_price: u64,
        monthly_price: u64,
        buyout_price: u64,
    ) {
        let creator_addr = signer::address_of(creator);
        
        // Create a simple object for the AI Moderator
        let constructor_ref = object::create_object(creator_addr);
        let object_signer = object::generate_signer(&constructor_ref);
        
        // Store AI Moderator data
        move_to(&object_signer, AIModerator {
            creator: creator_addr,
            name,
            description,
            personality,
            hourly_price,
            monthly_price,
            buyout_price,
            created_at: timestamp::now_seconds(),
            total_licenses_sold: 0,
            revenue_earned: 0,
            upvotes: 0,
        });
    }

    /// Purchase a license for an AI Moderator (original function - kept for compatibility)
    public entry fun purchase_license(
        buyer: &signer,
        moderator_address: address,
        level: u8,
    ) acquires AIModerator {
        let buyer_addr = signer::address_of(buyer);
        
        // Verify the moderator exists
        assert!(exists<AIModerator>(moderator_address), E_INVALID_MODERATOR);
        
        // Create the License NFT
        let token_constructor_ref = token::create_named_token(
            buyer,
            string::utf8(b"Citadel AI Moderators Collection"),
            string::utf8(b"License for AI Moderator"),
            string::utf8(b"Citadel License"),
            option::none(),
            string::utf8(b"https://citadel.ai/license/")
        );
        
        let token_signer = object::generate_signer(&token_constructor_ref);
        
        // Store License data
        move_to(&token_signer, License {
            moderator_address,
            owner: buyer_addr,
            level,
            is_upgraded: false,
            purchased_at: timestamp::now_seconds(),
            upgrade_data: string::utf8(b""),
        });
        
        // Update moderator stats
        let moderator = borrow_global_mut<AIModerator>(moderator_address);
        moderator.total_licenses_sold = moderator.total_licenses_sold + 1;
        moderator.revenue_earned = moderator.revenue_earned + (level as u64) * 100; // Simple pricing
    }

    /// Purchase a license for an AI Moderator with pricing tiers
    public entry fun purchase_license_v2(
        buyer: &signer,
        moderator_id: String,
        pricing_type: u8, // 1 = hourly, 2 = monthly, 3 = buyout
        payment_amount: u64,
    ) {
        let buyer_addr = signer::address_of(buyer);
        
        // Calculate required payment based on pricing type
        let required_amount = calculate_price(pricing_type);
        assert!(payment_amount >= required_amount, E_INSUFFICIENT_PAYMENT);
        
        // Create the License NFT
        let token_constructor_ref = token::create_named_token(
            buyer,
            string::utf8(b"Citadel AI Moderators Collection"),
            string::utf8(b"License for AI Moderator"),
            moderator_id,
            option::none(),
            string::utf8(b"https://citadel.ai/license/")
        );
        
        let token_signer = object::generate_signer(&token_constructor_ref);
        
        // Store License data with pricing information
        move_to(&token_signer, License {
            moderator_address: @citadel, // Use module address as placeholder
            owner: buyer_addr,
            level: pricing_type,
            is_upgraded: false,
            purchased_at: timestamp::now_seconds(),
            upgrade_data: string::utf8(b""),
        });
        
        // Update global stats (simplified for now)
        // In a real implementation, you'd update specific moderator stats
    }

    /// Calculate price based on pricing type
    fun calculate_price(pricing_type: u8): u64 {
        if (pricing_type == 1) {
            499000000 // $4.99 in Octas (1 APT = 100,000,000 Octas)
        } else if (pricing_type == 2) {
            29999000000 // $299.99 in Octas
        } else if (pricing_type == 3) {
            199999000000 // $1999.99 in Octas
        } else {
            0
        }
    }

    /// Upgrade a license (Streamer function)
    public entry fun upgrade_license(
        owner: &signer,
        license_address: address,
        new_level: u8,
        upgrade_data: String,
    ) acquires License {
        let owner_addr = signer::address_of(owner);
        
        // Verify license exists and ownership
        assert!(exists<License>(license_address), E_INVALID_LICENSE);
        let license = borrow_global_mut<License>(license_address);
        assert!(license.owner == owner_addr, E_NOT_AUTHORIZED);
        
        // Update license
        license.level = new_level;
        license.is_upgraded = true;
        license.upgrade_data = upgrade_data;
    }

    /// Start a deployment session (Streamer function)
    public entry fun start_session(
        streamer: &signer,
        license_address: address,
        platform: String,
    ) acquires License {
        let streamer_addr = signer::address_of(streamer);
        
        // Verify license exists and ownership
        assert!(exists<License>(license_address), E_INVALID_LICENSE);
        let license = borrow_global<License>(license_address);
        assert!(license.owner == streamer_addr, E_NOT_AUTHORIZED);
        
        // Create session NFT
        let token_constructor_ref = token::create_named_token(
            streamer,
            string::utf8(b"Citadel AI Moderators Collection"),
            string::utf8(b"Active Deployment Session"),
            string::utf8(b"Citadel Session"),
            option::none(),
            string::utf8(b"https://citadel.ai/session/")
        );
        
        let token_signer = object::generate_signer(&token_constructor_ref);
        
        // Store session data
        move_to(&token_signer, DeploymentSession {
            license_address,
            streamer: streamer_addr,
            platform,
            start_time: timestamp::now_seconds(),
            end_time: 0,
            is_active: true,
        });
    }

    /// End a deployment session (Streamer function)
    public entry fun end_session(
        streamer: &signer,
        session_address: address,
    ) acquires DeploymentSession {
        let streamer_addr = signer::address_of(streamer);
        
        // Verify session exists and ownership
        assert!(exists<DeploymentSession>(session_address), E_NO_ACTIVE_SESSION);
        let session = borrow_global_mut<DeploymentSession>(session_address);
        assert!(session.streamer == streamer_addr, E_NOT_AUTHORIZED);
        assert!(session.is_active, E_NO_ACTIVE_SESSION);
        
        // End the session
        session.end_time = timestamp::now_seconds();
        session.is_active = false;
    }

    /// Upvote an AI Moderator
    public entry fun upvote_moderator(
        _voter: &signer,
        moderator_address: address,
    ) acquires AIModerator {
        // Verify the moderator exists
        assert!(exists<AIModerator>(moderator_address), E_INVALID_MODERATOR);
        
        // Update upvote count
        let moderator = borrow_global_mut<AIModerator>(moderator_address);
        moderator.upvotes = moderator.upvotes + 1;
    }

    // View functions
    #[view]
    public fun get_moderator_info(moderator_address: address): (String, String, String, u64, u64, u64, u64, u64, u64, u64) acquires AIModerator {
        assert!(exists<AIModerator>(moderator_address), E_INVALID_MODERATOR);
        let moderator = borrow_global<AIModerator>(moderator_address);
        (
            moderator.name,
            moderator.description,
            moderator.personality,
            moderator.hourly_price,
            moderator.monthly_price,
            moderator.buyout_price,
            moderator.created_at,
            moderator.total_licenses_sold,
            moderator.revenue_earned,
            moderator.upvotes
        )
    }

    #[view]
    public fun get_license_info(license_address: address): (address, address, u8, bool, u64) acquires License {
        assert!(exists<License>(license_address), E_INVALID_LICENSE);
        let license = borrow_global<License>(license_address);
        (
            license.moderator_address,
            license.owner,
            license.level,
            license.is_upgraded,
            license.purchased_at
        )
    }

    #[view]
    public fun get_session_info(session_address: address): (address, address, String, u64, u64, bool) acquires DeploymentSession {
        assert!(exists<DeploymentSession>(session_address), E_NO_ACTIVE_SESSION);
        let session = borrow_global<DeploymentSession>(session_address);
        (
            session.license_address,
            session.streamer,
            session.platform,
            session.start_time,
            session.end_time,
            session.is_active
        )
    }
}
