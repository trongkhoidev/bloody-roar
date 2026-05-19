---
name: "Unified Platform & Trust Enhancements"
type: "planning"
status: "completed"
---

# Implementation Plan: Unified Platform & Trust Enhancements

## Scope & Status Reconciliation
- **Feature Name:** Unified Platform & Trust Enhancements
- **Current Status:** Phase 1 completed. E2E Tests for Chatbox scaffolded in Phase 2. Proceeding to Phase 2/3/4/5 and newly added Phase 6 (eKYC).
- **New Discoveries:** User introduced "Cross-Device eKYC (PC to Mobile)" with Liveness Detection and Soulbound Token (SBT) minting. This has been appended to the requirements and design docs and organized into a new Phase 6.

## Phase 1: Core UI & Role Unification (Immediate Fixes)
- [x] Unify navigation menu for all users in `MainLayout.jsx`.
- [x] Remove the global footer component.
- [x] Redesign the Marketplace filter bar in `IssueList.jsx`.
- [x] Update `User` model schemas and backend authorization logic to remove `CLIENT`/`DEVELOPER` distinction.

## Phase 2: Chatbox Verification & Testing
- [x] Review the Chatbox implementation for real-time WebSockets logic.
- [x] Write integration and Playwright tests to simulate two users exchanging messages. (`e2e/chatbox.spec.js` created)
- [x] Integrate the AI Masking layer in the chat backend to block API keys and PII.

## Phase 3: Smart Contract & Blockchain Integration
- [x] Develop the Dual-Deposit Escrow Smart Contract in Solidity.
- [x] Write tests for the contract (Stake, Release, Clawback, Slashing).
- [x] Connect the frontend to interact with the new Escrow methods.

## Phase 4: Sandbox & Automated Verification
- [x] Setup the Docker/Kubernetes provisioning logic in the backend for the Minimal Reproducible Environment.
- [x] Integrate `code-server` into the Docker images.
- [x] Setup CI/CD listeners and Oracle relayers to push test results to the Smart Contract.
- [x] Implement Asymmetric Visibility (hide PR code from poster until approved).

## Phase 5: Anti-Fraud & AI Dispute Assistant
- [x] Integrate `FingerprintJS` on the frontend and link it to the User model.
- [x] Build the AI Dispute Assistant prompt chain (gathering logs, diffs, chat history, and evaluating them).
- [x] Create the Admin dashboard for dispute resolution.

## Phase 6: Cross-Device eKYC & Soulbound Tokens (NEW)
- [x] Integrate eKYC SDK (e.g., Sumsub/Persona) into the mobile web frontend for Liveness detection and ID scanning.
- [x] Implement WebSocket "handshake" logic (QR Code generator) to link PC session with Mobile session.
- [x] Create a secure Webhook endpoint to receive `APPROVED` status from the eKYC Provider.
- [x] Develop the Soulbound Token (SBT) Smart Contract and minting script triggered by the Webhook.
- [x] Update PC frontend to auto-resume flow upon WebSocket success signal.

**Risks:** 
- Sandbox provisioning might have latency issues.
- Smart Contract vulnerabilities; requires a thorough audit before mainnet.
- Cross-Device WebSocket connections may drop; need robust reconnect logic.
