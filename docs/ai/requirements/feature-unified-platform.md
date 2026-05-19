---
name: "Unified Platform & Trust Enhancements"
type: "requirements"
status: "approved"
---

# Feature Requirements: Unified Platform & Trust Enhancements

## 1. Problem Statement
The current Bug-fixing Marketplace suffers from "Asymmetric Trust" between Clients and Developers. Clients fear source code theft and developers fear not getting paid. Additionally, the platform currently separates roles (Client vs Developer), which is rigid and prevents developers from seeking help from other developers. The user interface also lacks polish (e.g., empty filters, redundant footers, untested chatbox). Furthermore, there is a need to prevent sophisticated fraud (multi-accounting, deepfakes) which requires a robust, user-friendly eKYC solution.

## 2. Goals & Non-Goals
### Goals
- **Unified Roles:** Eliminate the strict `CLIENT` and `DEVELOPER` distinction. Everyone is a `USER`. Any user can post tasks or solve tasks.
- **Trust Mechanism (Smart Contracts):** Implement an Escrow system with Dual-Deposit (poster deposits reward, solver deposits a fixed 10% commitment stake) and a Clawback/Slashing mechanism based on time limits.
- **Secure Sandbox:** Introduce a Minimal Reproducible Environment (MRE) via web-based VSCode where the solver works on the code without downloading the entire repository to their local machine.
- **Automated Verification:** Use CI/CD tests and ZK-proofs to verify the fix works, combined with an AI-Verification layer to ensure the code is safe and meets quality standards before creating a PR.
- **Dispute Resolution:** Build an AI Dispute Assistant to help admins quickly resolve conflicts based on sandbox logs (micro-diffs and terminal history).
- **Anti-Fraud (Cross-Device eKYC):** Implement a robust Cross-Device eKYC flow (PC to Mobile) using an SDK (e.g., Sumsub/Persona) for 3D Liveness Detection, followed by minting a **Revocable Soulbound Token (SBT)** funded by the platform (gasless for the user).
- **UI & Quality:** Clean up the UI by removing the footer, repositioning the marketplace filters for a better layout, and adding thorough testing for the real-time chatbox.

### Non-Goals
- Building our own complete cloud IDE from scratch (we will leverage existing solutions like code-server or OpenVSCode Server).
- Complete decentralization of the dispute system (admins still make the final call assisted by AI).
- Building our own FaceID/Liveness recognition engine (we will use a specialized third-party eKYC SDK).

## 3. User Stories
- As a User, I can post a task and deposit crypto so that a solver knows the funds are secured.
- As a User, I can browse tasks, accept one, and deposit a small stake (10%) to prove my commitment.
- As a Poster, I can trust that the solver will not see my full source code directly, but only work within a controlled Sandbox.
- As a Solver, I know that if I pass the automated CI/CD tests, the Smart Contract will eventually pay me, even if the poster tries to back out.
- As an Admin, I can easily resolve disputes because the AI provides a summary of all sandbox logs, terminal commands, and chat history.
- As a User, if my PC doesn't have a webcam, I can easily scan a QR code to verify my identity via my smartphone's camera without losing my session on the PC, completely gas-free.

## 4. Success Criteria
- [x] Users can both create and apply for tasks using the same account.
- [x] The Footer component is removed globally.
- [x] The Marketplace filter is visually integrated as a polished toolbar.
- [x] The Chatbox operates without errors, verified by E2E test coverage.
- [x] Escrow contracts support the Dual-Deposit and Clawback rules.
- [x] AI masking prevents sensitive data leaks in the chatbox.
- [x] Users can complete eKYC on mobile and see their PC session auto-resume via WebSockets.
- [x] A Revocable SBT is minted successfully to the user's Web3 wallet upon KYC approval (gas paid by platform).

## 5. Constraints & Open Questions
- *Constraint:* Integration with Docker/Kubernetes for the Sandbox environment will require robust backend infrastructure.
- *Constraint:* The Web3 infrastructure must handle real-time SBT minting efficiently to prevent UX delays.
- *Open Questions:* All previously open questions regarding Gas Fees (Platform pays), Commitment Stake (Fixed 10%), and SBT Revocability (Yes, revocable) have been resolved.
