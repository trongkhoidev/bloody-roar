import dotenv from 'dotenv';
dotenv.config();

/**
 * All environment variables validated and exported from one place.
 * If a required variable is missing, the app fails fast on startup.
 */
function require(key, fallback) {
    const value = process.env[key] ?? fallback;
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

// ── Server ─────────────────────────────────────────────────────────────────
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || "development";

// ── Database ───────────────────────────────────────────────────────────────
export const MONGO_URI = require("MONGO_URI");

// ── Auth ───────────────────────────────────────────────────────────────────
export const JWT_SECRET = require("JWT_SECRET");
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ── Client ─────────────────────────────────────────────────────────────────
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ── GitHub ─────────────────────────────────────────────────────────────────
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
export const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || "";

// ── Blockchain ─────────────────────────────────────────────────────────────
export const BLOCKCHAIN_RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "";
export const ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS || "";
