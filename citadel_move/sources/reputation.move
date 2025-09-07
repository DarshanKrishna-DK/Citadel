/// # Citadel Reputation Contract
/// 
/// This contract handles the on-chain social layer including upvotes,
/// verifiable usage statistics, and reputation scoring for AI models.
/// 
/// ## Key Features:
/// - Upvoting system with license verification
/// - Usage statistics tracking
/// - Reputation score calculation
/// - Anti-spam protection
/// 
module citadel::reputation {
    use std::signer;
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use citadel::marketplace;

    /// Error codes
    const E_NO_LICENSE_FOR_AI: u64 = 1;
    const E_ALREADY_UPVOTED: u64 = 2;
    const E_NOT_AUTHORIZED: u64 = 3;
    const E_REPUTATION_NOT_FOUND: u64 = 4;
    const E_INVALID_AI_MODEL: u64 = 5;

    /// Reputation data attached to an AI model
    struct ReputationData has key, store {
        /// Total upvotes received
        total_upvotes: u64,
        /// Total hours the AI model has been used
        total_hours_used: u64,
        /// Number of unique users who have used this AI
        unique_users: u64,
        /// Average session duration in hours
        average_session_duration: u64,
        /// Reputation score (calculated based on various factors)
        reputation_score: u64,
        /// Last time reputation was updated
        last_updated: u64,
        /// Total number of sessions
        total_sessions: u64,
    }

    /// User upvote tracking to prevent duplicate votes
    struct UserUpvotes has key {
        /// Set of AI model addresses this user has upvoted
        upvoted_models: vector<address>,
    }

    /// Events
    #[event]
    struct UpvoteEvent has drop, store {
        streamer_address: address,
        ai_model_address: address,
        new_upvote_count: u64,
        timestamp: u64,
    }

    #[event]
    struct UsageStatsUpdatedEvent has drop, store {
        ai_model_address: address,
        hours_added: u64,
        new_total_hours: u64,
        new_reputation_score: u64,
        timestamp: u64,
    }

    /// Upvote an AI model (requires owning a license for that model)
    /// 
    /// @param streamer The account giving the upvote
    /// @param ai_model_address Address of the AI model to upvote
    public entry fun upvote(
        streamer: &signer,
        ai_model_address: address,
    ) acquires ReputationData, UserUpvotes {
        let streamer_address = signer::address_of(streamer);
        
        // Verify the streamer has a license for this AI model
        // Note: This is a simplified check - in practice, you'd iterate through user's licenses
        assert!(marketplace::has_license_for_ai(streamer_address, ai_model_address), E_NO_LICENSE_FOR_AI);
        
        // Initialize user upvotes if not exists
        if (!exists<UserUpvotes>(streamer_address)) {
            move_to(streamer, UserUpvotes {
                upvoted_models: vector::empty<address>(),
            });
        };
        
        // Check if user has already upvoted this model
        let user_upvotes = borrow_global_mut<UserUpvotes>(streamer_address);
        assert!(!vector::contains(&user_upvotes.upvoted_models, &ai_model_address), E_ALREADY_UPVOTED);
        
        // Add to user's upvoted models
        vector::push_back(&mut user_upvotes.upvoted_models, ai_model_address);
        
        // Get or create reputation data
        if (!exists<ReputationData>(ai_model_address)) {
            // In a real implementation, this would need proper authorization
            // For now, we'll create it here
            let reputation_data = ReputationData {
                total_upvotes: 0,
                total_hours_used: 0,
                unique_users: 0,
                average_session_duration: 0,
                reputation_score: 100,
                last_updated: timestamp::now_seconds(),
                total_sessions: 0,
            };
            // Note: This would need to be moved to the AI model's address
            // which requires more complex object management
        };
        
        // Increment upvote count (simplified for this example)
        if (exists<ReputationData>(ai_model_address)) {
            let reputation = borrow_global_mut<ReputationData>(ai_model_address);
            reputation.total_upvotes = reputation.total_upvotes + 1;
            reputation.last_updated = timestamp::now_seconds();
            
            // Update reputation score
            update_reputation_score(reputation);
            
            // Emit event
            event::emit(UpvoteEvent {
                streamer_address,
                ai_model_address,
                new_upvote_count: reputation.total_upvotes,
                timestamp: timestamp::now_seconds(),
            });
        };
    }

    /// Record usage statistics (called by usage_escrow contract)
    public fun record_usage_stats_internal(
        ai_model_address: address,
        hours: u64,
    ) acquires ReputationData {
        // Only update if reputation data exists
        if (exists<ReputationData>(ai_model_address)) {
            let reputation = borrow_global_mut<ReputationData>(ai_model_address);
            
            // Update usage statistics
            reputation.total_hours_used = reputation.total_hours_used + hours;
            reputation.total_sessions = reputation.total_sessions + 1;
            reputation.last_updated = timestamp::now_seconds();
            
            // Recalculate average session duration
            if (reputation.total_sessions > 0) {
                reputation.average_session_duration = reputation.total_hours_used / reputation.total_sessions;
            };
            
            // Update reputation score
            update_reputation_score(reputation);
            
            // Emit event
            event::emit(UsageStatsUpdatedEvent {
                ai_model_address,
                hours_added: hours,
                new_total_hours: reputation.total_hours_used,
                new_reputation_score: reputation.reputation_score,
                timestamp: timestamp::now_seconds(),
            });
        };
    }

    /// Update reputation score based on various factors
    fun update_reputation_score(reputation: &mut ReputationData) {
        // Base score starts at 100
        let score = 100u64;
        
        // Add points for upvotes (1 point per upvote, max 200 points)
        let upvote_points = if (reputation.total_upvotes > 200) {
            200
        } else {
            reputation.total_upvotes
        };
        let score = score + upvote_points;
        
        // Add points for usage hours (1 point per 10 hours, max 300 points)
        let usage_points = if (reputation.total_hours_used / 10 > 300) {
            300
        } else {
            reputation.total_hours_used / 10
        };
        let score = score + usage_points;
        
        // Add points for session consistency (longer average sessions = better)
        let consistency_points = if (reputation.average_session_duration > 10) {
            50 // Bonus for sessions longer than 10 hours on average
        } else if (reputation.average_session_duration > 5) {
            25 // Bonus for sessions longer than 5 hours on average
        } else {
            0
        };
        let score = score + consistency_points;
        
        // Cap maximum score at 1000
        reputation.reputation_score = if (score > 1000) {
            1000
        } else {
            score
        };
    }

    /// Remove upvote (in case of abuse detection)
    public entry fun remove_upvote(
        admin: &signer,
        streamer_address: address,
        ai_model_address: address,
    ) acquires ReputationData, UserUpvotes {
        let admin_address = signer::address_of(admin);
        assert!(admin_address == @citadel_admin, E_NOT_AUTHORIZED);
        
        // Remove from user's upvoted models
        if (exists<UserUpvotes>(streamer_address)) {
            let user_upvotes = borrow_global_mut<UserUpvotes>(streamer_address);
            let (found, index) = vector::index_of(&user_upvotes.upvoted_models, &ai_model_address);
            if (found) {
                vector::remove(&mut user_upvotes.upvoted_models, index);
            };
        };
        
        // Decrement upvote count
        if (exists<ReputationData>(ai_model_address)) {
            let reputation = borrow_global_mut<ReputationData>(ai_model_address);
            if (reputation.total_upvotes > 0) {
                reputation.total_upvotes = reputation.total_upvotes - 1;
                reputation.last_updated = timestamp::now_seconds();
                update_reputation_score(reputation);
            };
        };
    }

    // === View Functions ===

    /// Get reputation data for an AI model
    #[view]
    public fun get_reputation_data(ai_model_address: address): (u64, u64, u64, u64, u64, u64, u64) acquires ReputationData {
        if (!exists<ReputationData>(ai_model_address)) {
            return (0, 0, 0, 0, 100, 0, 0) // Default values
        };
        
        let reputation = borrow_global<ReputationData>(ai_model_address);
        (
            reputation.total_upvotes,
            reputation.total_hours_used,
            reputation.unique_users,
            reputation.average_session_duration,
            reputation.reputation_score,
            reputation.last_updated,
            reputation.total_sessions
        )
    }

    /// Get just the upvote count for an AI model
    #[view]
    public fun get_upvote_count(ai_model_address: address): u64 acquires ReputationData {
        if (!exists<ReputationData>(ai_model_address)) {
            return 0
        };
        
        let reputation = borrow_global<ReputationData>(ai_model_address);
        reputation.total_upvotes
    }

    /// Get reputation score for an AI model
    #[view]
    public fun get_reputation_score(ai_model_address: address): u64 acquires ReputationData {
        if (!exists<ReputationData>(ai_model_address)) {
            return 100 // Default starting score
        };
        
        let reputation = borrow_global<ReputationData>(ai_model_address);
        reputation.reputation_score
    }

    /// Check if a user has upvoted a specific AI model
    #[view]
    public fun has_user_upvoted(user_address: address, ai_model_address: address): bool acquires UserUpvotes {
        if (!exists<UserUpvotes>(user_address)) {
            return false
        };
        
        let user_upvotes = borrow_global<UserUpvotes>(user_address);
        vector::contains(&user_upvotes.upvoted_models, &ai_model_address)
    }

    /// Get total usage hours for an AI model
    #[view]
    public fun get_total_usage_hours(ai_model_address: address): u64 acquires ReputationData {
        if (!exists<ReputationData>(ai_model_address)) {
            return 0
        };
        
        let reputation = borrow_global<ReputationData>(ai_model_address);
        reputation.total_hours_used
    }

    /// Get all AI models a user has upvoted
    #[view]
    public fun get_user_upvoted_models(user_address: address): vector<address> acquires UserUpvotes {
        if (!exists<UserUpvotes>(user_address)) {
            return vector::empty<address>()
        };
        
        let user_upvotes = borrow_global<UserUpvotes>(user_address);
        user_upvotes.upvoted_models
    }
}