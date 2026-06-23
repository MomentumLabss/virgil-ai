# Virgil

**Your AI Agent Acts. 0G Remembers. You Have Proof.**

> Set a condition in plain English. Virgil monitors Web3, takes action, and writes every decision permanently to 0G decentralized storage - where no one can alter or delete it.

Live: [virgil-ai-one.vercel.app](https://virgil-ai-one.vercel.app)

---

## What is this?

I built Virgil because I got tired of manually watching wallets, refreshing price charts, and reacting too late to on-chain events. The idea is simple: tell Virgil what to watch in plain English, and it handles the rest. Every decision the agent makes gets written permanently to [0G](https://0g.ai) decentralized storage so there is a cryptographically verifiable audit trail - no company server, no middleman.

Some examples of instructions that work right now:

- *"Alert me if wallet 0x... moves more than 5 ETH"*
- *"Alert me if ETH price drops below $2000"*
- *"Watch wallet 0x... and notify me of any transaction"*

The AI understands plain English. You do not need to write queries or code anything.

---

## Use Cases (User's Perspective)

**1. Whale Watching & Copy Trading**
Track institutional or "smart money" wallets. Instead of constantly checking Etherscan, tell Virgil: *"Alert me if wallet 0xabc... transfers more than 10 ETH."* You get a permanent, verifiable receipt of exactly when the movement was detected.

**2. Automated DeFi Price Alerts**
Set custom price targets for your crypto portfolio without relying on centralized exchange notifications. For example: *"Watch ETH and notify me if the price drops below $2000."* 

**3. Cold Storage / Security Monitoring**
Keep an eye on your own vaults or multi-sig wallets. Set an instruction like: *"Watch wallet 0x123... and alert me of any outgoing transaction."* Virgil acts as an automated security guard for your funds.

**4. Tamper-Proof Audit Trails**
Because Virgil logs every evaluation to the **0G Decentralized Storage Network**, it creates a public, immutable receipt. If you need cryptographic proof that a specific on-chain event occurred at an exact timestamp, Virgil provides a verifiable link that anyone can audit.

---

## Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Wallet**: RainbowKit + Wagmi v2
- **AI**: Groq LPU - llama-3.3-70b-versatile for near-instant instruction parsing and the Virgil Copilot chat
- **Blockchain Data**: Etherscan API + CoinGecko API
- **Storage**: 0G Decentralized Storage via @0gfoundation/0g-storage-ts-sdk
- **Styling**: TailwindCSS + Framer Motion

---

## Running it locally

### Prerequisites

- Node.js 18+
- A Groq API key (free at console.groq.com)
- An Etherscan API key (free at etherscan.io/apis)
- Optional: a 0G wallet private key for real decentralized storage

### Setup

    git clone https://github.com/MomentumLabss/virgil-ai
    cd virgil-ai/virgil
    npm install
    cp .env.local.example .env.local
    npm run dev

Open http://localhost:3000.

### Environment Variables

    GROQ_API_KEY=your_groq_key_here
    ETHERSCAN_API_KEY=your_etherscan_key_here
    OG_PRIVATE_KEY=your_0g_wallet_private_key
    NEXT_PUBLIC_0G_RPC_URL=https://evmrpc-testnet.0g.ai
    NEXT_PUBLIC_0G_STORAGE_RPC=https://indexer-storage-testnet-turbo.0g.ai

Without the 0G keys the app still runs fully - it stores data in memory for testing. You will see a banner in the dashboard when 0G is unavailable.

---

## Project Structure

    src/
    app/
      api/
        parse/          # Groq: converts plain English to a structured instruction
        instructions/   # Save and fetch instructions via 0G storage
        evaluate/       # Agent evaluation - checks conditions against live data
        verify/         # Public record verification (no wallet needed)
        copilot/        # Streaming AI chat responses
      dashboard/        # Main user dashboard
      verify/           # Public proof/verification page
      page.tsx          # Landing page
    components/
      home/             # Landing page sections
      dashboard/        # Instruction input, cards, activity feed
      copilot/          # Virgil Copilot chat panel
      shared/           # Toast, badges, banners, etc.
    lib/
      0g/               # 0G SDK integration and storage helpers
      ai/               # Groq integration (parse, evaluate, copilot)
      data/             # Etherscan + CoinGecko API clients
      utils/            # Formatting and constants
    types/              # Shared TypeScript interfaces

---

## How it works

1. **Connect wallet** - RainbowKit handles EVM wallet connection. Your wallet address is your identity, no email or account needed.
2. **Give an instruction** - Type what you want Virgil to watch. Groq AI parses it in under a second into a structured condition with a target, threshold, and action.
3. **Agent monitors** - While the dashboard is open, Virgil polls every 30 seconds. It pulls live data from Etherscan or CoinGecko and checks your condition.
4. **0G stores the proof** - Every evaluation gets written to 0G decentralized storage with a SHA-256 hash. The record is permanent and publicly verifiable.
5. **Verify anytime** - Share the verification link with anyone. They can confirm what the agent decided, when, and that no one tampered with the record.

---

## API Endpoints

| Route | Method | What it does |
|-------|--------|--------------|
| /api/parse | POST | Parse a plain English instruction using Groq |
| /api/instructions | GET, POST | Fetch or save instructions to 0G |
| /api/evaluate | POST | Run one evaluation cycle for an instruction |
| /api/verify | GET | Fetch and verify a record from 0G |
| /api/copilot | POST | Stream responses from the Virgil Copilot |

---

## Notes

- **0G Testnet**: The 0G testnet can occasionally be unreachable - this is a network-level issue on 0G side, not a bug in Virgil. The app shows a clear warning banner when this happens and continues to function normally.
- **Agent polling**: The agent runs while the dashboard tab is open. A background service for 24/7 monitoring is on the roadmap.
- **Confidence scores**: When Groq parses an instruction it returns a confidence score. Anything below 70% triggers a clarification prompt before activation.

---

## What is next

- Telegram bot notifications when agent conditions are triggered
- Background monitoring service (so the tab does not need to stay open)
- More condition types: DAO votes, contract events, NFT transfers
- Activity timeline chart
- Mobile app

---

## License

MIT - Built for the 0G Vibe Coding Tournament, Zero Cup 2026
