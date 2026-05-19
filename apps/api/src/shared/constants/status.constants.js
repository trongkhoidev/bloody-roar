/**
 * Status enums — replaces all magic strings for status fields.
 */

export const ISSUE_STATUS = Object.freeze({
    OPEN: "OPEN",
    ONGOING: "ONGOING",
    WAITING_REVIEW: "WAITING_REVIEW",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
});

export const APPLICATION_STATUS = Object.freeze({
    PENDING: "PENDING",
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED",
});

export const PAYMENT_STATUS = Object.freeze({
    PENDING: "pending",
    DEPOSITED: "deposited",
    RELEASED: "released",
    REFUNDED: "refunded",
    DISPUTED: "disputed",
});

export const AUDIT_ACTION = Object.freeze({
    ESCROW_DEPOSIT: "escrow_deposit",
    ESCROW_RELEASE: "escrow_release",
    ESCROW_REFUND: "escrow_refund",
    ESCROW_DISPUTE: "escrow_dispute",
    GITHUB_CONNECT: "github_connect",
    GITHUB_DISCONNECT: "github_disconnect",
    GITHUB_BRANCH_CREATE: "github_branch_create",
    GITHUB_COMMIT: "github_commit",
    GITHUB_PR_CREATE: "github_pr_create",
    BLOCKCHAIN_ERROR: "blockchain_error",
});
