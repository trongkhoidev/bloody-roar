/**
 * Global Constants for Bloody Roar Platform
 */

export const IssueStatus = {
    OPEN: "OPEN",
    PENDING_CONFIRM: "PENDING_CONFIRM",
    ONGOING: "ONGOING",
    WAITING_REVIEW: "WAITING_REVIEW",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
};

export const IssueCategory = {
    WEB: "Web",
    MOBILE: "Mobile",
    BLOCKCHAIN: "Blockchain",
    AI: "AI",
    GAME: "Game",
    OTHER: "Other",
};

export const UserRole = {
    CLIENT: "CLIENT",
    DEVELOPER: "DEVELOPER",
    BOTH: "BOTH",
    ADMIN: "ADMIN",
};

export const ApplicationStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
};

export const PaymentStatus = {
    NONE: "NONE",
    ESCROWED: "ESCROWED",
    RELEASED: "RELEASED",
    DISPUTED: "DISPUTED",
    REFUNDED: "REFUNDED",
};

export const WorkspaceStatus = {
    ACTIVE: "ACTIVE",
    ARCHIVED: "ARCHIVED",
    DELETED: "DELETED",
};

export const NotificationType = {
    JOB_MATCH: "JOB_MATCH",
    NEW_APPLICATION: "NEW_APPLICATION",
    APPLICATION_STATUS: "APPLICATION_STATUS",
    NEW_COMMENT: "NEW_COMMENT",
    CHAT_MESSAGE: "CHAT_MESSAGE",
    WORKSPACE_UPLOADED: "WORKSPACE_UPLOADED",
};
