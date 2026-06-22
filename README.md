# Virgil

**Your AI Agent Acts. 0G Remembers. You Have Proof.**

Virgil is an AI-powered agent that monitors Web3 conditions on your behalf — and writes a permanent, tamper-proof, cryptographically verifiable audit trail of every decision to 0G decentralized storage.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- API keys for: Groq, Etherscan, 0G (optional - app works in demo mode without 0G)

### Installation

```bash
# 1. Navigate to the project
cd virgil

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your API keys

# 4. Run the development server
npm run dev

# 5. Open http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key for extremely fast Llama 3 inference (instruction parsing and copilot) |
| `ETHERSCAN_API_KEY` | Yes | For Ethereum blockchain data |
| `0G_PRIVATE_KEY` | No | 0G wallet private key (enables real 0G storage via Indexer) |
| `NEXT_PUBLIC_APP_URL` | No | App URL (default: http://localhost:3000) |

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 18, TypeScript, TailwindCSS, Framer Motion, Recharts
- **Wallet**: RainbowKit + Wagmi v2 + Viem
- **AI**: Groq Llama 3 API (instruction parsing, decision reasoning, copilot chat)
- **Blockchain Data**: Etherscan API, CoinGecko API
- **Storage**: 0G Decentralized Storage (`@0gfoundation/0g-storage-ts-sdk`)

### Project Structure

```
virgil/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── parse/         # Parse plain English instructions
│   │   │   ├── instructions/  # CRUD for instructions on 0G
│   │   │   ├── evaluate/      # Agent evaluation cycle
│   │   │   ├── verify/        # Public record verification
│   │   │   └── copilot/       # AI copilot streaming
│   │   ├── dashboard/         # Main dashboard page
│   │   ├── verify/            # Public verification page
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Homepage
│   │   ├── error.tsx          # Error boundary
│   │   └── not-found.tsx      # 404 page
│   ├── components/
│   │   ├── home/              # Hero, HowItWorks, WhyVirgil
│   │   ├── dashboard/         # InstructionInput, InstructionCard, etc.
│   │   ├── copilot/           # AI chat panel
│   │   ├── verify/            # Certificate component
│   │   ├── layout/            # Navbar, Footer
│   │   ├── shared/            # StatusBadge, HashDisplay, Toast, etc.
│   │   └── providers.tsx      # Wagmi + RainbowKit providers
│   ├── lib/
│   │   ├── 0g/               # 0G SDK Indexer client and storage helpers
│   │   ├── ai/               # Groq Llama 3 integration
│   │   ├── crypto/           # SHA-256 hashing for records
│   │   ├── data/             # Etherscan, CoinGecko wrappers
│   │   ├── utils/            # Formatting, constants
│   │   └── wagmi.ts          # Wallet configuration
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript interfaces
│   └── styles/               # Global CSS with design tokens
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/parse` | POST | Parse plain English instruction with Groq |
| `/api/instructions` | POST, GET | Save/fetch instructions to/from 0G Indexer |
| `/api/evaluate` | POST | Run agent evaluation cycle |
| `/api/verify` | GET | Fetch and verify record from 0G |
| `/api/copilot` | POST | Stream AI copilot responses |

## Demo Script (90 seconds)

1. **Homepage (0:00-0:15)**: Show the hero, explain the value proposition — "Every agent decision written permanently to 0G"
2. **Connect Wallet (0:15-0:25)**: Connect with RainbowKit, redirect to dashboard
3. **Create Instruction (0:25-0:45)**: Type a plain English instruction like "Alert me if ETH price drops below $2000", watch Groq parse it instantly, confirm activation
4. **Agent Activity (0:45-1:05)**: Click "Check Now" to trigger immediate evaluation, show the record being created and stored via the 0G Indexer
5. **Verification Page (1:05-1:30)**: Click "View proof" to open the public verification page — no wallet required. Show the hash verification, 0G storage key, and cryptographic integrity proof

## Decisions Made

1. **0G Fallback**: When 0G is not configured, the app uses an in-memory store with clear warnings. This allows demoing without 0G credentials while keeping the 0G integration real and toggle-ready.
2. **Indexer Implementation**: Completed full migration to `@0gfoundation/0g-storage-ts-sdk` Indexer API using Merkle trees for decentralized file indexing.
3. **Groq Llama 3**: Swapped Anthropic Claude to Groq for near-instant inference, drastically reducing agent latency.
4. **Polling-based Agent**: Since this is a web app (not a service), the agent runs via 30-second polling when the dashboard is open. This is the pragmatic v1 approach.
5. **Recharts deferred**: The spec mentioned Recharts for timeline visualization but this was deprioritized in favor of the core happy path (instruction → evaluate → verify).

## Next Steps to Complete

1. **Telegram Bot Notifications**: Integrate a Telegram bot to send real-time alerts when agent actions occur.
2. **Add Recharts timeline visualization**: For showing agent activity over time.
3. **Add QR code to certificate**: Use `qrcode.react` for the verification URL.
4. **Add more condition types**: Implement `dao_event` and `contract_interaction` evaluators.
5. **Background service**: Convert polling to a proper background job system.

## License

MIT — Built for Zero Cup 2026
