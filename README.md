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
- **AI**: Groq LPU (llama-3.3-70b-versatile) for near-instant instruction parsing and Copilot chat
- **Blockchain Data**: Etherscan API (Modularized for easy Alchemy/Moralis drop-in) + CoinGecko
- **Storage**: 0G Decentralized Storage via @0gfoundation/0g-storage-ts-sdk

---

## Running it locally

    git clone https://github.com/MomentumLabss/virgil-ai
    cd virgil-ai/virgil
    npm install
    cp .env.local.example .env.local
    npm run dev

**Environment Variables Needed:**
`GROQ_API_KEY`, `ETHERSCAN_API_KEY`, `OG_PRIVATE_KEY`

---

## How to Use Virgil AI

So you want to use Virgil? It's incredibly simple. You don't need to know how to code, write complex queries, or set up webhooks. 

1. **Connect your wallet** — Just hit the connect button. Your wallet is your identity here. No emails, no passwords.
2. **Tell Virgil what to watch** — Head to the Dashboard and type exactly what you want in plain English. Something like *"Alert me if Vitalik's wallet moves more than 10 ETH"* or *"Notify me if the price of Bitcoin drops below $50k"*.
3. **Let the agent work** — Virgil will immediately start monitoring the blockchain and live price feeds for you. It checks every few minutes automatically.
4. **Get your proof** — When your condition is met, Virgil triggers an action and writes a cryptographic record of *why* it made that decision straight to the 0G network. You'll see a green "Verification Link" pop up on your dashboard.
5. **Share the receipt** — Send that Verification Link to anyone. They don't even need a wallet to view it. They can click through to the 0G Explorer and prove mathematically that Virgil executed your instruction exactly as promised.

---

## License

MIT - Built for the 0G Vibe Coding Tournament, Zero Cup 2026
