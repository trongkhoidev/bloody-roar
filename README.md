# 🩸 Bloody Roar Platform

Bloody Roar is a decentralized, trust-minimized bounty marketplace for software developers and clients. It features role unification, a Solidity-based **Dual-Deposit Escrow** payment system, a secure web-based **Sandbox environment**, real-time chat with **AI-driven PII/API Masking**, and a seamless **Cross-Device eKYC (PC to Mobile)** identity verification system powered by **Soulbound Tokens (SBT)**.

---

## 🏗️ Project Architecture & Layout

This project is organized as a **pnpm monorepo** using unified workspaces. It isolates frontend, backend API, and blockchain components for modern development.

```
bloody-roar/
├── apps/
│   ├── api/            # Express.js Core Backend (Node.js) with WebSockets & AI Guard
│   │   └── src/        # Monolithic Clean-Architecture backend modules
│   ├── web/            # React + Vite + Tailwind CSS Frontend Portal
│   └── blockchain/     # Hardhat Smart Contract suite & Deployment scripts
├── packages/
│   └── shared-types/   # Shared typescript types / JS contracts between services
├── docs/
│   └── ai/             # System specifications, requirements, designs, and analysis
│       ├── requirements/
│       └── design/     # Detailed specifications of Escrow and KYC flows
├── start.sh            # Port-clearing & Concurrent execution automated shell script
└── package.json        # Workspace orchestrator configurations
```

---

## ⚡ Core Trust Features

### 🏺 1. Dual-Deposit Escrow Payments (`BloodyRoarEscrow.sol`)
To eliminate the "asymmetric trust" between developers (afraid of work theft) and clients (afraid of code quality issues or ghosting), the platform uses a cọc kép (dual-deposit) game-theory payment system:
*   **Client Deposit:** Upon creating a bounty, the client deposits **110%** of the reward (`100% Bounty + 10% Client Stake`).
*   **Developer Commitment:** To claim the task, the developer deposits **10%** (`Developer Stake`) equivalent to the client's cọc.
*   **Resolution:** Upon successful completion, the client releases funds: client gets their 10% cọc back, and developer receives **110%** (`100% Bounty + 10% Developer Stake`).
*   **Dispute Slashing:** If a dispute arises, an independent **Arbiter** evaluates the issue. The losing party's 10% cọc is slashed and sent to the platform, while the winner receives their cọc and the bounty.

### 👤 2. Cross-Device eKYC & Soulbound Tokens (`KycSoulboundToken.sol`)
To prevent Sybil attacks and multi-accounting fraud:
*   **QR-Handshake:** Users on PC scan a WebSocket-paired QR code to bridge the session to their smartphone.
*   **Liveness Verification:** Users perform 3D face scan and ID capture on mobile web.
*   **Soulbound NFT Minting:** Upon Sumsub/Persona `APPROVED` webhook event, the platform gaslessly mints a **Revocable Soulbound Token (SBT)** to the user's wallet.
*   **Lock Mechanism:** The SBT overrides ERC721's `_update` hook, rendering it strictly non-transferable (transfer transactions revert), binding the verified identity to the user's account.

### 🛡️ 3. AI Moderation & Masking Guard
*   **PII & Secrets Filter:** Real-time WebSockets chat integrates an AI Masking layer that automatically censors API keys, secrets, and private personal information (PII) before writing messages to database, preventing leak hazards.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js v20+](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

### 1. Installation
Install workspace dependencies concurrently at the root level:
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root folder, and also in `apps/api`:
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```
Fill in the secret configurations (such as your MongoDB URI, JWT secret, GitHub OAuth tokens, and blockchain arbiter keys).

### 3. Automated One-Click Development Startup
We provide an advanced startup script `start.sh` that cleans up standard dev ports (`3000`, `5173`, `5174`, `8545`), spins up background dependencies, and boots the development servers.
```bash
chmod +x start.sh
./start.sh
```

**What the script does automatically:**
1. Kills processes occupying ports `3000` (Backend API), `5173` (React Portal), `5174` (Doc Portal), and `8545` (Hardhat Blockchain node).
2. Launches a local Hardhat Node in the background (`http://127.0.0.1:8545`).
3. Starts the Documentation portal dev server in the background (`http://localhost:5174`).
4. Runs the parallel development server for both frontend and backend concurrently.

---

## 🛠️ CLI Development Commands

Manage applications across the workspace using root-level scripts:

| Command | Action | CWD |
| :--- | :--- | :--- |
| `pnpm dev` | Runs both Backend API and Frontend Portal concurrently | Root |
| `pnpm dev:api` | Starts Node.js Express server only (port `3000`) | Root |
| `pnpm dev:web` | Starts React Vite Frontend only (port `5173`) | Root |
| `pnpm test:api` | Runs API Jest tests (Webhook / WebSockets Handshake) | Root |
| `pnpm test:contract` | Runs Smart Contract Hardhat unit tests | Root |

---

## 🧪 Testing Suites

The platform has rigorous unit and integration test coverage:

### Smart Contract Hardening
Validate the Dual-Deposit Escrow, timeout claims, Slashing penalties, and circuit breakers:
```bash
pnpm test:contract
```

### Backend API Integration
Test eKYC WebSocket pairing channels, Sumsub simulation webhooks, and SBT mint triggers:
```bash
pnpm test:api
```

---

## 🏺 System Analysis & Specs

Detailed design specs, Mermaid flowcharts, and technical analyses are available inside the `/docs` directory:
*   [Smart Contract Specification](file:///Users/admin/repos/bloody-roar/docs/ai/design/smart-contract-analysis.md) - State diagrams and transition details.
*   [Platform Requirements Document](file:///Users/admin/repos/bloody-roar/docs/ai/requirements/feature-unified-platform.md) - Project scope, constraints, and success criteria.
*   [Lazy-Deposit Architecture Plan](file:///Users/admin/repos/bloody-roar/docs/ai/design/lazy-deposit-flow.md) - Blockchain gas optimizations.
