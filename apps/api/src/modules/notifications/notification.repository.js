import Notification from "../../shared/models/notification.model.js";

/**
 * NotificationRepository — handles all database operations for notifications.
 */
export class NotificationRepository {
    /**
     * Get all notifications for a specific user.
     * @param {string} userId
     * @returns {Promise<Array>}
     */
    async getNotificationsByUserId(userId) {
        return Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .populate("sender", "name avatar")
            .lean();
    }

    /**
     * Get a single notification by ID.
     * @param {string} id
     * @returns {Promise<Object>}
     */
    async findById(id) {
        return Notification.findById(id);
    }

    /**
     * Mark all unread notifications for a user as read.
     * @param {string} userId
     */
    async markAllAsRead(userId) {
        return Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );
    }

    /**
     * Create a new notification.
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async create(data) {
        return Notification.create(data);
    }
}

export default new NotificationRepository();
