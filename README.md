# VIRGIL

**Verifiable AI Agent Executor**  
*Built on 0G — The Decentralized AI Infrastructure*

Your AI agent watches Web3 for you. Every decision it makes is permanently recorded on 0G. Cryptographic proof. No trust required.

**Zero Cup 2026 — 0G Global Vibe Coding Tournament**  
*June 2026 — v1.0*

---

## 1. Executive Summary

Virgil is an AI-powered agent executor built on 0G's decentralized infrastructure. Users instruct Virgil in plain English to monitor wallets, track price conditions, and watch on-chain events. The agent runs quietly in the background, checks conditions in real time, and takes action when they are met.

What makes Virgil different from every other automation tool is a single, fundamental guarantee: every decision the agent makes is permanently written to 0G's decentralized storage, creating a tamper-proof, cryptographically verifiable audit trail that no company, government, or bad actor can alter or delete.

This is not a feature. It is the foundation. Virgil exists because trustless automation requires trustless proof.

**One-line pitch**  
Virgil is an AI agent that acts on your behalf in Web3 — and leaves a permanent, verifiable receipt for everything it does, stored forever on 0G.

---

## 2. The Problem

### 2.1 Automated agents exist. Verifiable agents do not.
Web3 automation tools are not new. Trading bots, alert systems, and DAO voting delegates have existed for years. But every single one of them shares the same fundamental flaw: you have to trust the platform.

When your bot executes a trade, fires an alert, or casts a vote on your behalf, there is no independent record of what it did. The log lives on the platform's server. The platform can edit it, delete it, go bankrupt, or be pressured by external parties. The only proof you have is the platform's own word.

### 2.2 Three scenarios where this breaks down
- **DAO governance:** You delegate voting power to an AI agent. A disputed vote leads to a governance crisis. Did the agent vote as instructed? There is no way to prove it without trusting the platform that ran the agent.
- **Treasury management:** A multisig DAO uses an AI agent to execute transactions. Regulators, auditors, or co-signers need a verifiable audit trail. Currently impossible without a trusted intermediary.
- **Automated trading:** Your agent made a decision that lost funds. Was it a bug or your instruction? Without a tamper-proof log, there is no way to prove either way in a dispute.

### 2.3 The gap in the market
| Tool | What it lacks |
|------|---------------|
| Gelato Network | No AI reasoning layer. No permanent audit trail on decentralized storage. |
| Olas / Autonolas | Requires deep technical setup. Audit trail is not the core value. |
| Trading bots | Centralized logs only. No cryptographic proof of decisions. |
| DAO voting delegates | Trust-based. No independent verification of vote execution. |
| **Virgil** | **Plain English instructions + permanent verifiable log on 0G.** |

---

## 3. The Solution

### 3.1 Virgil in plain English
You connect your wallet and type an instruction in plain English. Virgil's AI layer parses your instruction, identifies the condition to monitor, the threshold to watch, and the action to take when the condition is met.

The agent then runs continuously in the background, pulling real-time data from Etherscan, price APIs, and on-chain event streams. When your condition is met, the agent generates a structured decision record, writes it permanently to 0G, and notifies you.

Every single step is logged. Every decision the agent considered. Every condition it checked. Every action it took or declined to take. All of it, permanent, on 0G.

### 3.2 What you can instruct Virgil to do
- *"Alert me if wallet 0x... moves more than 5 ETH to any address"*
- *"Notify me when ETH drops below $2,800 and log the exact price and timestamp"*
- *"Watch this DAO proposal and tell me when voting opens"*
- *"Monitor this contract for any new interactions and record them"*
- *"Alert me if my wallet receives any token I have never held before"*

**Shadow execution in v1**
In the initial release, Virgil operates in shadow execution mode. The agent monitors real conditions using live data and logs every decision to 0G, but does not execute real transactions autonomously. This keeps v1 safe, auditable, and demonstrable without risk. Real transaction execution with hard spending limits ships in v2.

---

## 4. Why 0G Is the Foundation

### 4.1 The core dependency
Virgil could have been built on Firebase. Or AWS. Or any centralized database. The audit trail would look identical. But it would be worthless.

A log stored on a company's server is only as trustworthy as that company. It can be edited to cover mistakes. It can be deleted under legal pressure. It disappears when the company shuts down. None of those guarantees are good enough for a tool that acts on your behalf in financial contexts.

0G provides three properties that make Virgil's audit trail genuinely trustworthy:
- **Permanence:** once written to 0G, a record cannot be deleted by anyone — not Virgil, not 0G, not a government.
- **Tamper-proof:** the cryptographic hash of every record is stored on-chain. Any modification is immediately detectable.
- **Trustless:** a third party can verify any Virgil record without trusting Virgil, without creating an account, and without any intermediary.

### 4.2 What Virgil writes to 0G
Every agent action generates a structured record written to 0G:
- **instruction_id**: Unique identifier for the user instruction
- **wallet_address**: The wallet that created the instruction
- **condition_checked**: The exact condition the agent evaluated
- **data_observed**: The real-time data that triggered or did not trigger the condition
- **decision**: Triggered / Not triggered, with reasoning
- **action_taken**: What the agent did in response
- **timestamp**: Unix timestamp of the decision
- **record_hash**: SHA-256 hash of the full record for integrity verification

### 4.3 The verification flow
Every 0G record generates a shareable verification URL. Anyone with this link can:
1. Open the verification page without creating an account
2. View the complete decision record retrieved from 0G
3. See the record hash recomputed and compared for integrity
4. Confirm the record is genuine and has not been altered

**Without 0G, Virgil cannot function as designed**
If 0G storage is unavailable, Virgil displays a degraded confidence warning and will not generate a verification certificate. The permanent audit trail is not a feature that can be disabled — it is the product.

---

## 5. User Flow

### 5.1 Onboarding
1. User lands on the Virgil homepage
2. User connects wallet via MetaMask, Rabby, or WalletConnect
3. Virgil queries 0G to check if this wallet has existing agents or prior records
4. Returning users are taken directly to their agent dashboard
5. New users are shown a clean onboarding screen

### 5.2 Creating an instruction
1. User types their instruction in plain English
2. Virgil's AI parses the instruction and extracts: target, condition, threshold, action
3. If the instruction is ambiguous, Virgil asks one clarifying question and loops back
4. User reviews the parsed parameters and confirms
5. Instruction is written to 0G with status: active

### 5.3 Agent monitoring
1. Agent begins polling real-time data sources
2. On each poll, the agent evaluates the condition against live data
3. If condition is not met, agent continues polling
4. If condition is met, agent generates a structured decision record
5. Decision record is written permanently to 0G
6. User receives an in-app notification

### 5.4 Verification
1. User receives a shareable verification link with every triggered action
2. Any third party opens the link without logging in
3. Verification page fetches the record from 0G
4. Hash integrity is checked and displayed
5. Full decision record is shown: condition, data, reasoning, timestamp, proof

---

## 6. Technical Architecture

### 6.1 Tech stack
- **Frontend:** Next.js 15, React, TypeScript, TailwindCSS, Shadcn UI
- **Wallet connection:** RainbowKit, Wagmi, Viem
- **AI layer:** Groq Llama 3.3 API (natural language parsing, decision reasoning, CoVirgil Chat)
- **Real-time data:** Etherscan API, CoinGecko API, on-chain event listeners
- **Decentralized storage:** 0G Storage SDK — all agent records and instructions
- **Backend:** Next.js API routes, TypeScript

### 6.2 Core API routes
- `POST /api/parse` — accepts plain English instruction, returns structured parameters
- `POST /api/instructions` — writes confirmed instruction to 0G, returns instruction ID
- `GET /api/instructions/[wallet]` — retrieves all active instructions for a wallet from 0G
- `POST /api/evaluate` — agent calls this on each poll cycle; evaluates condition, writes to 0G if triggered
- `GET /api/verify/[record_id]` — public endpoint; fetches record from 0G, verifies hash, returns certificate
- `POST /api/copilot` — AI chat interface for querying agent history and explaining decisions

### 6.3 0G storage structure
All data is namespaced by wallet address and instruction ID:
- `instructions/{wallet_address}/{instruction_id}` — the original instruction and parsed parameters
- `records/{instruction_id}/{timestamp}` — individual decision records
- `certificates/{record_hash}` — verification certificates indexed by hash

---

## 7. Competition Compliance

### 7.1 Built during the tournament window
Virgil is being built from scratch beginning June 15, 2026, in compliance with Zero Cup submission criteria. All code is original work produced by the team during the tournament window.

### 7.2 0G is a genuine core dependency
Virgil cannot function as designed without 0G. Removing 0G storage does not degrade the product — it eliminates the product's core value proposition entirely. The verification system, the permanent audit trail, and the trustless proof mechanism all depend on 0G's decentralized, immutable storage. This is not a bolt-on integration.

### 7.3 AI-native construction
Virgil is built using vibe coding — AI tools, copilots, and prompt-driven development are central to the construction process, consistent with the Zero Cup's ethos and rules.

> **VIRGIL**  
> Your agent acts. 0G remembers. You have proof.  
> *Zero Cup 2026 — Built on 0G*
