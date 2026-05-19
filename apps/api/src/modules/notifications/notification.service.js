import notificationRepository from "./notification.repository.js";
import { socketRegistry } from "../../shared/socket/SocketRegistry.js";
import { domainEvents } from "../../shared/events/DomainEventEmitter.js";
import { DOMAIN_EVENTS } from "../../shared/constants/events.constants.js";
import logger from "../../shared/logger/logger.js";

/**
 * NotificationService — orchestrates notification logic, including
 * real-time delivery via sockets and listening to domain events.
 */
export class NotificationService {
    constructor(repository) {
        this.repository = repository;
        this.setupEventHandlers();
    }

    /**
     * Set up listeners for various domain events across the system.
     * This decouples other modules from the notification logic.
     */
    setupEventHandlers() {
        // 1. Issue Applied
        domainEvents.on(DOMAIN_EVENTS.ISSUE_APPLIED, async (payload) => {
            await this.createAndEmit({
                recipient: payload.clientId,
                sender: payload.developerId,
                type: "ISSUE_APPLIED",
                message: `New application for your issue: ${payload.issueTitle}`,
                link: `/issue/${payload.issueId}`,
            });
        });

        // 2. Issue Approved
        domainEvents.on(DOMAIN_EVENTS.ISSUE_APPROVED, async (payload) => {
            await this.createAndEmit({
                recipient: payload.developerId,
                sender: payload.clientId,
                type: "ISSUE_APPROVED",
                message: `Your application was approved for: ${payload.issueTitle}`,
                link: `/issue/${payload.issueId}`,
            });
        });

        // 3. Comment Created
        domainEvents.on(DOMAIN_EVENTS.COMMENT_CREATED, async (payload) => {
            // Logic to prevent self-notification usually handled here or in controller
            if (payload.recipientId.toString() === payload.senderId.toString()) return;

            await this.createAndEmit({
                recipient: payload.recipientId,
                sender: payload.senderId,
                type: "COMMENT_NEW",
                message: `New comment on your issue: ${payload.issueTitle}`,
                link: `/issue/${payload.issueId}`,
            });
        });

        // 4. Comment Replied
        domainEvents.on(DOMAIN_EVENTS.COMMENT_REPLIED, async (payload) => {
            if (payload.recipientId.toString() === payload.senderId.toString()) return;

            await this.createAndEmit({
                recipient: payload.recipientId,
                sender: payload.senderId,
                type: "COMMENT_REPLY",
                message: `Someone replied to your comment on: ${payload.issueTitle}`,
                link: `/issue/${payload.issueId}`,
            });
        });

        // 5. Escrow Events
        domainEvents.on(DOMAIN_EVENTS.ESCROW_DEPOSITED, async (payload) => {
             await this.createAndEmit({
                recipient: payload.developerId,
                sender: payload.clientId,
                type: "ESCROW_DEPOSITED",
                message: `Funds deposited for: ${payload.issueTitle}`,
                link: `/issue/${payload.issueId}`,
            });
        });

        domainEvents.on(DOMAIN_EVENTS.ESCROW_RELEASED, async (payload) => {
            await this.createAndEmit({
                recipient: payload.developerId,
                sender: payload.clientId,
                type: "ESCROW_RELEASED",
                message: `Payment released for: ${payload.issueTitle}`,
                link: `/issue/${payload.issueId}`,
            });
        });

        // 6. GitHub events
        domainEvents.on("github:pr_merged", async (payload) => {
            // Notify Dev
            await this.createAndEmit({
                recipient: payload.developerId,
                type: "APPLICATION_STATUS",
                message: `Your PR for "${payload.issueTitle}" was merged! Payment pending.`,
                link: `/issue/${payload.issueId}`,
            });
            // Notify Client
            await this.createAndEmit({
                recipient: payload.clientId,
                type: "APPLICATION_STATUS",
                message: `PR for "${payload.issueTitle}" merged. Please release escrow.`,
                link: `/issue/${payload.issueId}`,
            });
        });

        logger.info("🔔 Notification service event handlers registered");
    }

    /**
     * Get unread notifications for a user.
     * @param {string} userId
     */
    async getUserNotifications(userId) {
        return this.repository.getNotificationsByUserId(userId);
    }

    /**
     * Mark a single notification or all of them as read.
     * @param {string} userId
     * @param {string} notificationId - 'all' or specific ID
     */
    async markAsRead(userId, notificationId) {
        if (notificationId === "all") {
            return this.repository.markAllAsRead(userId);
        }

        const notification = await this.repository.findById(notificationId);
        if (!notification) throw new Error("Notification not found");

        if (notification.recipient.toString() !== userId.toString()) {
            throw new Error("Not authorized");
        }

        notification.isRead = true;
        return notification.save();
    }

    /**
     * Internal helper to create a notification in DB AND push via Socket.
     */
    async createAndEmit(data) {
        try {
            const notification = await this.repository.create(data);
            const populated = await notification.populate("sender", "name avatar");

            // Real-time delivery
            socketRegistry.emitToUser(data.recipient, "new_notification", populated);

            return populated;
        } catch (err) {
            logger.error({ err, data }, "Failed to create/emit notification");
        }
    }
}

export default new NotificationService(notificationRepository);
