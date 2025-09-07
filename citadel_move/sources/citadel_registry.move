/// # Citadel Registry Contract
/// 
/// This contract serves as the foundational layer for creating and managing
/// the core assets: AI Models and Creator profiles in the Citadel ecosystem.
/// 
/// ## Key Features:
/// - Creator profile registration and management
/// - AI Model minting and metadata management
/// - Event emission for tracking activities
/// 
module citadel::citadel_registry {
    use std::string::String;
    use std::signer;
    use aptos_framework::object::{Self, Object, ObjectCore};
    use aptos_framework::event;

    /// Error codes
    const E_NOT_CREATOR: u64 = 1;
    const E_CREATOR_ALREADY_EXISTS: u64 = 2;
    const E_INVALID_NAME: u64 = 3;
    const E_INVALID_METADATA_URI: u64 = 4;

    /// Creator Profile Object - represents a verified AI creator
    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct CreatorProfile has key {
        /// Creator's display name
        name: String,
        /// Total number of AI models created
        total_models: u64,
        /// Creator's reputation score
        reputation_score: u64,
        /// Timestamp when profile was created
        created_at: u64,
    }

    /// AI Model Object - represents a master AI NFT
    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct AIModel has key {
        /// Reference to the creator's address
        creator_address: address,
        /// AI model name
        name: String,
        /// Metadata URI pointing to AI model details
        metadata_uri: String,
        /// Category of the AI (e.g., "moderation", "analytics", "entertainment")
        category: String,
        /// Timestamp when model was minted
        created_at: u64,
        /// Base hourly rate in APT (in octas)
        base_hourly_rate: u64,
        /// Whether the model is active and available for licensing
        is_active: bool,
    }

    /// Events
    #[event]
    struct CreatorRegisteredEvent has drop, store {
        creator_address: address,
        name: String,
        timestamp: u64,
    }

    #[event]
    struct MintAIEvent has drop, store {
        creator_address: address,
        ai_model_address: address,
        name: String,
        category: String,
        base_hourly_rate: u64,
        timestamp: u64,
    }

    /// Register a new creator profile
    /// 
    /// @param signer The account registering as a creator
    /// @param name The creator's display name
    public entry fun register_creator(
        signer: &signer,
        name: String,
    ) {
        let creator_address = signer::address_of(signer);
        
        // Validate input
        assert!(std::string::length(&name) > 0, E_INVALID_NAME);
        
        // Check if creator already exists
        assert!(!exists<CreatorProfile>(creator_address), E_CREATOR_ALREADY_EXISTS);
        
        // Create creator profile object
        let constructor_ref = object::create_object(creator_address);
        let object_signer = object::generate_signer(&constructor_ref);
        
        // Initialize creator profile
        move_to(&object_signer, CreatorProfile {
            name,
            total_models: 0,
            reputation_score: 100, // Starting reputation
            created_at: aptos_framework::timestamp::now_seconds(),
        });
        
        // Transfer object to creator
        let creator_profile_object = object::object_from_constructor_ref<CreatorProfile>(&constructor_ref);
        object::transfer(signer, creator_profile_object, creator_address);
        
        // Emit event
        event::emit(CreatorRegisteredEvent {
            creator_address,
            name,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    /// Mint a new AI model NFT
    /// 
    /// @param creator The creator's signer
    /// @param name The AI model name
    /// @param metadata_uri URI pointing to model metadata
    /// @param category The AI model category
    /// @param base_hourly_rate Base hourly rate in octas
    public entry fun mint_ai_model(
        creator: &signer,
        name: String,
        metadata_uri: String,
        category: String,
        base_hourly_rate: u64,
    ) {
        let creator_address = signer::address_of(creator);
        
        // Validate inputs
        assert!(std::string::length(&name) > 0, E_INVALID_NAME);
        assert!(std::string::length(&metadata_uri) > 0, E_INVALID_METADATA_URI);
        
        // Assert creator has a profile
        assert!(has_creator_profile(creator_address), E_NOT_CREATOR);
        
        // Create AI model object
        let constructor_ref = object::create_object(creator_address);
        let object_signer = object::generate_signer(&constructor_ref);
        let ai_model_address = signer::address_of(&object_signer);
        
        // Initialize AI model
        move_to(&object_signer, AIModel {
            creator_address,
            name,
            metadata_uri,
            category,
            created_at: aptos_framework::timestamp::now_seconds(),
            base_hourly_rate,
            is_active: true,
        });
        
        // Update creator's model count
        let creator_profile = borrow_global_mut<CreatorProfile>(creator_address);
        creator_profile.total_models = creator_profile.total_models + 1;
        
        // Transfer object to creator
        let ai_model_object = object::object_from_constructor_ref<AIModel>(&constructor_ref);
        object::transfer(creator, ai_model_object, creator_address);
        
        // Emit event
        event::emit(MintAIEvent {
            creator_address,
            ai_model_address,
            name,
            category,
            base_hourly_rate,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    /// Update AI model status (active/inactive)
    public entry fun update_ai_model_status(
        creator: &signer,
        ai_model_address: address,
        is_active: bool,
    ) acquires AIModel {
        let creator_address = signer::address_of(creator);
        
        // Verify ownership and update status
        let ai_model = borrow_global_mut<AIModel>(ai_model_address);
        assert!(ai_model.creator_address == creator_address, E_NOT_CREATOR);
        
        ai_model.is_active = is_active;
    }

    /// Update AI model hourly rate
    public entry fun update_hourly_rate(
        creator: &signer,
        ai_model_address: address,
        new_rate: u64,
    ) acquires AIModel {
        let creator_address = signer::address_of(creator);
        
        // Verify ownership and update rate
        let ai_model = borrow_global_mut<AIModel>(ai_model_address);
        assert!(ai_model.creator_address == creator_address, E_NOT_CREATOR);
        
        ai_model.base_hourly_rate = new_rate;
    }

    // === View Functions ===

    /// Check if an address has a creator profile
    #[view]
    public fun has_creator_profile(creator_address: address): bool {
        exists<CreatorProfile>(creator_address)
    }

    /// Get creator profile information
    #[view]
    public fun get_creator_profile(creator_address: address): (String, u64, u64, u64) acquires CreatorProfile {
        assert!(exists<CreatorProfile>(creator_address), E_NOT_CREATOR);
        let profile = borrow_global<CreatorProfile>(creator_address);
        (profile.name, profile.total_models, profile.reputation_score, profile.created_at)
    }

    /// Get AI model information
    #[view]
    public fun get_ai_model(ai_model_address: address): (address, String, String, String, u64, u64, bool) acquires AIModel {
        let ai_model = borrow_global<AIModel>(ai_model_address);
        (
            ai_model.creator_address,
            ai_model.name,
            ai_model.metadata_uri,
            ai_model.category,
            ai_model.created_at,
            ai_model.base_hourly_rate,
            ai_model.is_active
        )
    }

    /// Check if AI model exists and is active
    #[view]
    public fun is_ai_model_active(ai_model_address: address): bool acquires AIModel {
        if (!exists<AIModel>(ai_model_address)) {
            return false
        };
        let ai_model = borrow_global<AIModel>(ai_model_address);
        ai_model.is_active
    }

    /// Get AI model creator address
    #[view]
    public fun get_ai_model_creator(ai_model_address: address): address acquires AIModel {
        let ai_model = borrow_global<AIModel>(ai_model_address);
        ai_model.creator_address
    }

    /// Get AI model hourly rate
    #[view]
    public fun get_ai_model_rate(ai_model_address: address): u64 acquires AIModel {
        let ai_model = borrow_global<AIModel>(ai_model_address);
        ai_model.base_hourly_rate
    }
}
