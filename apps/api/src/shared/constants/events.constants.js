/**
 * SOCKET_EVENTS — all Socket.io event name strings in one place.
 * Import on both server and client to keep them in sync.
 */
export const SOCKET_EVENTS = Object.freeze({
    // Connection
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    REGISTER_USER: "register_user",

    // Chat
    JOIN_ROOM: "join_room",
    SEND_MESSAGE: "send_message",
    RECEIVE_MESSAGE: "receive_message",
    CHAT_HISTORY: "chat_history",

    // Notifications
    NEW_NOTIFICATION: "new_notification",

    // Workspace / Collaboration
    CHAT_INITIATED: "chatInitiated",         // keep original name for compat
    FILE_UPDATED: "file_updated",
});

/**
 * DOMAIN_EVENTS — internal Node.js EventEmitter events between modules.
 */
export const DOMAIN_EVENTS = Object.freeze({
    ISSUE_APPLIED: "issue:applied",
    ISSUE_APPROVED: "issue:approved",
    COMMENT_CREATED: "comment:created",
    COMMENT_REPLIED: "comment:replied",
    ESCROW_DEPOSITED: "escrow:deposited",
    ESCROW_RELEASED: "escrow:released",
    ESCROW_REFUNDED: "escrow:refunded",
    GITHUB_WEBHOOK_PR_MERGED: "github:webhook:pr_merged",
});
