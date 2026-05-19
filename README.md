# 🩸 Bloody Roar Platform

Bloody Roar is a decentralized marketplace for developers and clients, featuring AI-guarded real-time chat, GitHub automation, and Smart Contract escrow payments.

## 🏗 Project Structure

This is a **pnpm monorepo** containing the following applications:

- **`apps/api`**: The core Backend API (Node.js/Express) with AI Guard and GitHub integration.
- **`apps/web`**: The modern Frontend (React/Vite).
- **`apps/blockchain`**: Smart contracts and blockchain integration scripts (Hardhat/Solidity).
- **`apps/api/documentation`**: A documentation portal for the project.

## 🚀 Quick Start

Ensure you have [pnpm](https://pnpm.io/) installed.

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```

2.  **Set up environment**:
    Copy `.env.example` to `.env` in the root and in `apps/api`.

3.  **Run in development**:
    ```bash
    pnpm dev
    ```
    This will start both the API and the Web frontend in parallel.

## 🛠 Tech Stack

- **Frontend**: React, TailwindCSS, Vite
- **Backend**: Node.js, Express, Socket.io, Mongoose
- **Blockchain**: Solidity, Hardhat, Ethers.js
- **AI**: OpenAI (Moderation & Content Analysis)
- **Database**: MongoDB

## 📅 Roadmap

See [ROADMAP.md](./ROADMAP.md) for the detailed project timeline and phases.
