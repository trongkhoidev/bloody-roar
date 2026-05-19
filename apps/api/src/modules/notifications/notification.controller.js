import notificationService from "./notification.service.js";
import { asyncHandler } from "../../shared/middleware/errorHandler.middleware.js";
import { ApiResponse } from "../../shared/response/ApiResponse.js";
import { NotFoundError, UnauthorizedError } from "../../shared/errors/errors.js";

/**
 * NotificationController — exposes notification actions via HTTP.
 */
export const getUserNotifications = asyncHandler(async (req, res) => {
    const notifications = await notificationService.getUserNotifications(req.user._id);
    res.status(200).json(ApiResponse.ok(notifications, "Notifications fetched"));
});

export const markAsRead = asyncHandler(async (req, res) => {
    try {
        const result = await notificationService.markAsRead(req.user._id, req.params.id);
        res.status(200).json(ApiResponse.ok(result, "Marked as read"));
    } catch (err) {
        if (err.message === "Notification not found") {
            throw new NotFoundError("Notification");
        }
        if (err.message === "Not authorized") {
            throw new UnauthorizedError("Not authorized to mark this notification as read");
        }
        throw err;
    }
});
