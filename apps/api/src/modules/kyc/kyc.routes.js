import express from "express";
import { protect } from "../../shared/middleware/auth.middleware.js";
import {
    createKycSession,
    handleKycWebhook,
    getKycSessionStatus
} from "./kyc.controller.js";

const router = express.Router();

// Public webhook route (called by Sumsub/Persona provider or web test simulation)
router.post("/webhook", handleKycWebhook);

// Protected routes
router.post("/session", protect, createKycSession);
router.get("/session/:sessionId", getKycSessionStatus);

export default router;
