# Project Progress Report

This document outlines the current progress of the Bloody Roar project across its three main layers: Backend (BE), Frontend (FE), and Smart Contracts.

## Backend (BE): What has been done?
- **Monorepo Integration**: The backend has been moved to a `apps/api` monorepo structure.
- **Core Technology**: Set up Node.js with Express and connected to MongoDB as the primary database.
- **Modules Implemented**:
  - `auth`: Authentication and authorization flows.
  - `chat`: Real-time chat integration (using Socket.io).
  - `issues` & `comments`: Issue tracking and comment threads.
  - `escrow`: Integration with the smart contract escrow logic.
  - `github`: Automation and integration with GitHub.
  - `workspaces`: Workspace management.
  - `notifications`, `analytics`, and `upload` (file handling).
- **AI Moderation**: Configured an AI Guard (OpenAI) for moderating content and chat.

## Frontend (FE): What has been done?
- **Monorepo Integration**: The frontend has been structured under `apps/web`.
- **Core Technology**: Initialized the project with React, Vite, and Tailwind CSS.
- **UI/UX Design**: Overhauled the UI with a modern dark theme inspired by Vercel for the bounty marketplace.
- **Pages & Features Built**: 
  - Admin panel
  - Dashboard
  - Marketplace
  - Authentication (Auth)
  - Real-time Chat UI
  - User Profiles
  - Workspace management
  - Analytics dashboards

## Smart Contract: What has been done?
- **Project Setup**: Initialized a Hardhat project under `apps/blockchain`.
- **Escrow Contract (`BloodyRoarEscrow.sol`)**: Successfully developed and deployed the core escrow contract which includes:
  - **State Management**: Handling states like `AWAITING_DELIVERY`, `COMPLETED`, `REFUNDED`, and `DISPUTED`.
  - **Deposits**: Clients can deposit funds tied to a specific issue/bounty.
  - **Timeout Claims**: Workers can claim funds automatically if the client is inactive after a 30-day timeout period.
  - **Releasing Funds**: Clients can manually release funds to the worker once the job is completed.
  - **Dispute System**: Both clients and workers can raise a dispute to lock funds.
  - **Arbiter Resolution**: An assigned arbiter can resolve disputes by either refunding the client or releasing the funds to the worker.
