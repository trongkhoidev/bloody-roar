// =====================================================
// app.js — Bloody-Roar Platform Server
// Phase 1 refactor: global error handler + structured logger integrated.
// Existing routes and middleware are UNCHANGED (Strangler Fig pattern).
// =====================================================
import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

// ── Config ────────────────────────────────────────────────────────
import { PORT } from "./src/infrastructure/config/env.js";
import connectDB from "./src/infrastructure/db/connection.js";

// ── New: Shared infrastructure ─────────────────────────────────────
import logger from "./src/shared/logger/logger.js";
import { errorHandler } from "./src/shared/middleware/errorHandler.middleware.js";

// ── New: Business Modules (Refactored) ──────────────────────────────
import analyticsRoutes from "./src/modules/analytics/analytics.routes.js";
import notificationRoutes from "./src/modules/notifications/notification.routes.js";
import commentRoutes from "./src/modules/comments/comment.routes.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import issueRoutes from "./src/modules/issues/issue.routes.js";
import chatRoutes from "./src/modules/chat/chat.routes.js";
import workspaceRoutes from "./src/modules/workspaces/workspace.routes.js";
import githubRoutes from "./src/modules/github/github.routes.js";
import githubWebhookRoutes from "./src/modules/github/webhook.routes.js";
import escrowRoutes from "./src/modules/escrow/escrow.routes.js";
import uploadRoutes from "./src/modules/upload/upload.routes.js";
import kycRoutes from "./src/modules/kyc/kyc.routes.js";

// ── Routes (existing — untouched) ───────────────────────────────────
// legacy authRoutes removed
// legacy issueRoutes removed
// legacy chatRoutes removed
// legacy commentRoutes removed
// legacy notificationRoutes removed
// legacy uploadRoutes removed
// legacy workspaceRoutes removed
// legacy analyticsRoutes removed from here
// legacy githubRoutes removed
// legacy webhookRoutes removed
// legacy escrowRoutes removed

// ── Sockets ────────────────────────────────────────────────────────────────
// ── New: Infrastructure ────────────────────────────────────────────
import { initializeSocket } from "./src/infrastructure/socket/SocketServer.js";

// ── Background Services ────────────────────────────────────────────────────
import { syncOnChainEvents } from "./src/shared/utils/escrowSyncer.js";

// ── Rate Limiting ──────────────────────────────────────────────────────────
import { globalLimiter, authLimiter } from "./src/shared/middleware/rateLimit.middleware.js";

// ── __dirname for ES modules ───────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Initialize Express + HTTP + Socket.io ─────────────────────────────────
const app = express();
const server = http.createServer(app);
initializeSocket(server);

// ── Connect Database, then start background jobs ───────────────────────────
connectDB().then(() => {
    syncOnChainEvents();
    setInterval(syncOnChainEvents, 5 * 60 * 1000);
});

// =====================================================
// Webhook routes BEFORE body parser (needs raw body for signature)
// =====================================================
app.use("/api/webhooks", githubWebhookRoutes);

// =====================================================
// Core Middleware
// =====================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(globalLimiter);

// =====================================================
// Routes
// =====================================================
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", commentRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/kyc", kycRoutes);

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "Bloody Roar Platform API is running" });
});

// =====================================================
// 404 — unmatched routes (returns JSON, not Express HTML default)
// =====================================================
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// =====================================================
// Global Error Handler — MUST be last middleware
// =====================================================
app.use(errorHandler);

// =====================================================
// Start Server
// =====================================================
server.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
// trigger restart