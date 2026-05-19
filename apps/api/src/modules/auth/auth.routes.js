import express from "express";
import {
    register,
    login,
    loginWithWeb3,
    linkWallet,
    getMe,
    updateProfile,
    adminLogin,
} from "./auth.controller.js";
import { protect } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/validation/validate.middleware.js";
import { z } from "zod";

const router = express.Router();

// ── Validation Schemas ──────────────────────────────────────────────
const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["CLIENT", "DEVELOPER", "ADMIN"]).optional(),
    skills: z.array(z.string()).optional(),
    githubUrl: z.string().url().optional().or(z.literal("")),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

const web3Schema = z.object({
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
    signature: z.string(),
    message: z.string(),
});

// ── Public Routes ───────────────────────────────────────────────────
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/web3-login", validate(web3Schema), loginWithWeb3);
router.post("/admin/login", validate(loginSchema), adminLogin);

// ── Private Routes ──────────────────────────────────────────────────
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/link-wallet", protect, linkWallet);

export default router;
