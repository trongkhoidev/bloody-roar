import express from "express";
import { getPlatformStats } from "./analytics.controller.js";
import { protect } from "../../shared/middleware/auth.middleware.js";
import { isAdmin } from "../../shared/middleware/admin.middleware.js";

const router = express.Router();

// Only admins can view platform stats
router.get("/stats", protect, isAdmin, getPlatformStats);

export default router;
