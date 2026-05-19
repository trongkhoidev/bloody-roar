import rateLimit from "express-rate-limit";

// Global rate limit: 100 requests per 15 minutes
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
});

// Strict rate limit for auth: 10 requests per 15 minutes (anti-brute-force)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts, please try again in 15 minutes." },
    skipSuccessfulRequests: true,
});
