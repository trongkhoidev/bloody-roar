import express from "express";
import { getUserNotifications, markAsRead } from "./notification.controller.js";
import { protect } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

/**
 * All notification routes are private.
 */
router.use(protect);

router.get("/", getUserNotifications);
router.put("/:id/read", markAsRead);

export default router;
