# 🛡️ Feature Plan: Hardening Bloody Roar Escrow

> **Feature:** Hardening the trustless escrow protocol and backend verification.
> **Status:** In Progress
> **Priority:** Critical

---

## 📊 Task Queue

### Phase 1: Smart Contract Hardening 🛠️
- [x] **Task 1.1:** Switch `issueId` from `string` to `bytes32` for gas efficiency.
- [x] **Task 1.2:** Implement `timeout` mechanism (e.g., 30 days) to prevent stuck funds.
- [x] **Task 1.3:** Remove unilateral `refund`; require `Arbiter` resolution or `Worker` consent.
- [x] **Task 1.4:** Implement `Ownable` and `Pausable` (Circuit Breaker) patterns.

### Phase 2: Backend Security & Deep Verification 🔒
- [x] Task 2.1: Implement `RPC_URL` and `CONTRACT_ADDRESS` config in backend.
- [x] Task 2.2: Create `blockchain.service.js` for receipt verification.
- [x] Task 2.3: Update `recordDeposit` and `recordRelease` controllers with deep verification.
- [x] Task 2.4: Setup background event synchronization worker.

### Phase 3: Integration & UX 🎨
- [x] Task 3.1: Update frontend `escrowService.js` to support bytes32 IDs and new events.
- [x] Task 3.2: Implement Dispute/Timeout UI buttons in `EscrowPanel.jsx`.

---

## 🛠️ Implementation Notes
- Backend should map MongoDB Hex IDs to `bytes32` (e.g., `0x` + id).
- Arbiter should be the platform's multisig or treasury address.
