# 🏰 Citadel - AI-Powered LiveStreaming Moderation Platform

**The Future of Livestream Moderation** - A revolutionary decentralized platform that provides real-time AI moderation for Twitch streamers, built on the Aptos blockchain with comprehensive content filtering and automated chat management.

## ✨ Key Features

### 🤖 **Real-Time AI Moderation**
- **Instant Content Filtering**: Comprehensive banned words detection with 70+ prohibited terms
- **Automatic Actions**: Real-time message deletion and user timeouts (10 minutes for violations)
- **Spam Detection**: Advanced algorithms detect excessive caps, repetitive messages, and spam patterns
- **Smart Moderation**: Bypasses moderation for channel moderators and subscribers

### 🎮 **Live Twitch Integration**
- **Real Twitch OAuth**: Seamless integration with your actual Twitch account
- **Live Chat Monitoring**: Direct connection to Twitch IRC for real-time message processing
- **Stream Status Detection**: Automatically detects when you're live and monitors viewer count
- **Professional Moderation**: Uses official Twitch APIs for timeout and ban actions

### 📊 **Advanced Analytics Dashboard**
- **Live Statistics**: Real-time tracking of chats analyzed, timeouts issued, and messages deleted
- **Toxicity Scoring**: Dynamic toxicity percentage based on chat quality (0-100%)
- **Stream Metrics**: Live viewer count, uptime tracking, and stream information
- **Moderation History**: Complete log of all AI actions taken

### 🔗 **Blockchain-Powered Marketplace**
- **Decentralized Marketplace**: Browse and purchase AI moderators with transparent pricing
- **Smart Contract Security**: All transactions secured by Aptos blockchain
- **NFT-Based Licensing**: Three ownership models (Hourly, License, Outright purchase)
- **Creator Economy**: Streamers can create and monetize their own AI moderators

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** with npm
- **Aptos Wallet** (Petra, Martian, or MSafe)
- **Twitch Account** for streaming integration
- **PostgreSQL** (optional, for full backend features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Citadel.git
   cd Citadel
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Configure Twitch Integration**
   
   Set up your Twitch application at [dev.twitch.tv](https://dev.twitch.tv/console):
   - **OAuth Redirect URL**: `http://localhost:3000/auth/twitch/callback`
   - **Client ID**: Your Twitch app client ID
   - **Client Secret**: Your Twitch app client secret

4. **Start the servers**
   
   **Backend (Terminal 1):**
   ```bash
   cd backend
   # Set environment variables and start server
   $env:TWITCH_CLIENT_ID="your_twitch_client_id"
   $env:TWITCH_CLIENT_SECRET="your_twitch_client_secret"
   node real-server.js
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000
   - **Health Check**: http://localhost:3000/api/health

## 🎮 How It Works

### 1. **Connect Your Twitch Account**
- Click "Connect with Twitch" in the dashboard
- Authorize Citadel to access your Twitch channel
- AI moderator connects to your live chat via Twitch IRC

### 2. **Real-Time AI Moderation**
- **Content Analysis**: Every chat message is instantly analyzed
- **Banned Words Detection**: 70+ prohibited terms automatically flagged
- **Instant Action**: Inappropriate messages deleted + users timed out
- **Smart Filtering**: Moderators and subscribers can be exempted

### 3. **Live Analytics**
- **Toxicity Score**: Real-time chat quality percentage (0-100%)
- **Moderation Stats**: Live counters for actions taken
- **Stream Metrics**: Viewer count, uptime, and stream information
- **Action Log**: Complete history of all moderation decisions

### 4. **Blockchain Integration**
- **Secure Transactions**: All purchases secured by Aptos blockchain
- **NFT Licenses**: Own your AI moderators as blockchain assets
- **Creator Rewards**: Earn from moderators you create and list

## 🔧 Configuration

### Required Environment Variables

**Backend Configuration:**
```bash
# Twitch Integration (Required)
TWITCH_CLIENT_ID="your_twitch_client_id"
TWITCH_CLIENT_SECRET="your_twitch_client_secret"

# Server Configuration
PORT=3000
BACKEND_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"

# Optional: Database (for advanced features)
DATABASE_URL="postgresql://postgres@localhost:5000/citadel"
JWT_SECRET="your-jwt-secret"
```

### Twitch Application Setup

1. **Create Twitch App**: Visit [dev.twitch.tv/console](https://dev.twitch.tv/console)
2. **Set OAuth Redirect**: `http://localhost:3000/auth/twitch/callback`
3. **Copy Credentials**: Client ID and Client Secret
4. **Set Scopes**: The app requests these permissions:
   - `chat:read` - Read chat messages
   - `chat:edit` - Send chat messages
   - `channel:moderate` - Moderate chat
   - `moderator:manage:banned_users` - Manage bans
   - `moderator:manage:chat_messages` - Delete messages
   - `user:read:email` - User identification

### Smart Contracts

**Aptos Testnet Deployment:**
- **Contract Address**: `0x5aa95162ba4b5475c4f1e506c68b53162fe5fb8272998bed3dc5119ab6ce4ce9`
- **Module**: `ai_moderator`
- **Network**: Aptos Testnet

## 🎯 User Guide

### For Streamers

1. **Connect Your Wallet**
   - Click "Connect Wallet" and select your Aptos wallet (Petra, Martian, etc.)
   - Sign the connection request to authenticate

2. **Browse AI Moderators**
   - Explore the marketplace of available AI moderators
   - View ratings, pricing, and moderation capabilities
   - Read reviews from other streamers

3. **Choose Your License**
   - **Hourly**: $4.99/hour - Pay-as-you-stream model
   - **License**: $299.99/month - Unlimited monthly usage
   - **Outright**: $1999.99 - Full ownership forever

4. **Connect to Twitch**
   - Go to your Dashboard → Click "Use" on your moderator
   - Click "Connect with Twitch" → Authorize on Twitch.tv
   - AI moderator connects to your channel's chat

5. **Go Live & Moderate**
   - Start streaming on Twitch as usual
   - AI automatically moderates your chat in real-time
   - Monitor analytics on the Live Dashboard

### For Creators

1. **Create AI Moderators**
   - Click "List Moderator" in the marketplace
   - Define moderation rules, pricing, and capabilities
   - Deploy your moderator as an NFT on Aptos blockchain

2. **Earn Revenue**
   - Receive payments when streamers use your moderators
   - Track usage analytics and performance metrics
   - Build reputation through user reviews

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Aptos Wallet Adapter** - Blockchain wallet integration
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** + **Express** - Server framework
- **Socket.IO** - Real-time WebSocket communication
- **tmi.js** - Twitch chat integration
- **TypeScript** - Type-safe development
- **Prisma ORM** - Database management (optional)
- **PostgreSQL** - Database (optional)

### Blockchain & APIs
- **Aptos Blockchain** - Decentralized transactions
- **Move Smart Contracts** - Secure contract logic
- **Twitch API** - OAuth, chat, and stream data
- **Twitch IRC** - Real-time chat monitoring

### AI & Moderation
- **Custom Content Filter** - 70+ banned words detection
- **Spam Detection** - Advanced pattern recognition
- **Real-time Processing** - Instant message analysis
- **Automated Actions** - Message deletion and user timeouts

## 📱 API Endpoints

### Core Endpoints
- `GET /api/health` - Server health check and status
- `POST /api/auth/twitch` - Initiate Twitch OAuth flow
- `GET /auth/twitch/callback` - Handle Twitch OAuth callback
- `POST /api/auth/twitch/disconnect` - Disconnect from Twitch chat

### Real-Time Features (WebSocket)
- **Connection Events**: Client connect/disconnect
- **Chat Messages**: Live Twitch chat messages
- **Moderation Stats**: Real-time analytics updates
- **Stream Status**: Live stream information
- **Moderation Actions**: AI action notifications

### Blockchain Integration
- **Smart Contract**: `ai_moderator` module on Aptos
- **Functions**: `mint_ai_moderator`, `purchase_license`, `upgrade_license`
- **Events**: Transaction confirmations and NFT transfers

## 🔒 Security & Privacy

### Blockchain Security
- **Aptos Blockchain**: All transactions secured by cryptographic consensus
- **Smart Contracts**: Audited Move contracts with secure ownership models
- **Wallet Integration**: Non-custodial - you control your private keys
- **Transaction Verification**: All purchases verified on-chain

### Twitch Integration Security
- **OAuth 2.0**: Industry-standard authentication flow
- **Scoped Permissions**: Only requests necessary chat moderation permissions
- **Secure Token Storage**: Access tokens handled server-side only
- **No Data Storage**: Chat messages processed in real-time, not stored

### AI Moderation Privacy
- **Real-Time Processing**: Messages analyzed instantly, not logged
- **No Personal Data**: Only processes public chat messages
- **Transparent Actions**: All moderation actions visible to streamers
- **Configurable Rules**: Streamers control moderation sensitivity

## 🐛 Troubleshooting

### Common Issues

1. **"Connect with Twitch" not working**
   - Ensure backend server is running on port 3000
   - Check Twitch app OAuth redirect URL matches exactly
   - Verify TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET are set

2. **Live Dashboard shows "Stream Offline"**
   - Make sure you're actually live streaming on Twitch
   - Check that Twitch OAuth was completed successfully
   - Verify your Twitch username appears in the dashboard

3. **AI not moderating chat**
   - Confirm you're connected to Twitch (green indicator)
   - Ensure you have moderator permissions in your own channel
   - Check browser console for WebSocket connection errors

4. **Wallet connection issues**
   - Install Petra, Martian, or MSafe wallet extension
   - Switch to Aptos testnet in your wallet
   - Clear browser cache and try reconnecting

### Debug Steps

1. **Check Server Status**: Visit `http://localhost:3000/api/health`
2. **Monitor Console**: Open browser dev tools for error messages
3. **Verify WebSocket**: Look for Socket.IO connection logs
4. **Test Twitch API**: Ensure your Twitch app credentials are valid

## 🚀 Roadmap

### Phase 1: Core Platform ✅
- [x] Real-time Twitch chat integration
- [x] AI content moderation with banned words detection
- [x] Blockchain marketplace on Aptos
- [x] Live analytics dashboard
- [x] WebSocket real-time communication

### Phase 2: Enhanced Features 🔄
- [ ] YouTube Live integration
- [ ] Custom moderation rule builder
- [ ] Advanced AI sentiment analysis
- [ ] Multi-language support
- [ ] Mobile app development

### Phase 3: Ecosystem Growth 📈
- [ ] Creator revenue sharing program
- [ ] Community-driven moderation rules
- [ ] Integration with other streaming platforms
- [ ] Advanced analytics and reporting
- [ ] White-label solutions for platforms

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

### Development Setup
1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch**: `git checkout -b feature/amazing-feature`
4. **Make your changes** and test thoroughly
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to your branch**: `git push origin feature/amazing-feature`
7. **Submit a pull request** with a clear description

### Contribution Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting
- Follow the existing code style and conventions

## 📞 Support & Community

### Get Help
- 🐛 **Bug Reports**: [Create an issue](https://github.com/your-username/Citadel/issues)
- 💡 **Feature Requests**: [Submit an enhancement](https://github.com/your-username/Citadel/issues)
- 📖 **Documentation**: Check this README and inline code comments
- 💬 **Community**: Join our Discord for real-time support

### Stay Updated
- ⭐ **Star this repo** to stay notified of updates
- 🐦 **Follow us on Twitter** [@CitadelAI](https://twitter.com/CitadelAI)
- 📺 **Subscribe to our YouTube** for tutorials and demos
- 📧 **Join our newsletter** for major announcements

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses
- **tmi.js**: Apache 2.0 License
- **Socket.IO**: MIT License
- **Aptos TS SDK**: Apache 2.0 License

---

<div align="center">

**🏰 Built with ❤️ for the creator economy on Aptos blockchain ✨**

*Empowering streamers with AI-powered moderation since 2024*

[Website](https://citadel-ai.com) • [Documentation](https://docs.citadel-ai.com) • [Discord](https://discord.gg/citadel) • [Twitter](https://twitter.com/CitadelAI)

</div>
