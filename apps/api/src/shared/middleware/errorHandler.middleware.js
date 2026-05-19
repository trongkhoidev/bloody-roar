import logger from "../logger/logger.js";
import { AppError } from "../errors/AppError.js";
import { ApiResponse } from "../response/ApiResponse.js";

/**
 * Global Express error handler.
 * Must be registered as the LAST middleware in app.js:
 *   app.use(errorHandler);
 *
 * Catches:
 *  - Operational errors (AppError subclasses) → structured 4xx/5xx
 *  - Mongoose validation errors → 400
 *  - JWT errors → 401
 *  - Unknown crashes → 500 (stack hidden in production)
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
    // ── Mongoose: cast error (invalid ObjectId, etc.) ─────────────────────
    if (err.name === "CastError") {
        return res.status(400).json(ApiResponse.error("Invalid ID format", 400));
    }

    // ── Mongoose: duplicate key ────────────────────────────────────────────
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        return res
            .status(409)
            .json(ApiResponse.error(`Duplicate value for ${field}`, 409));
    }

    // ── Mongoose: schema validation ────────────────────────────────────────
    if (err.name === "ValidationError") {
        const details = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return res
            .status(400)
            .json(ApiResponse.error("Validation failed", 400, details));
    }

    // ── JWT errors ─────────────────────────────────────────────────────────
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json(ApiResponse.error("Invalid token", 401));
    }
    if (err.name === "TokenExpiredError") {
        return res.status(401).json(ApiResponse.error("Token expired", 401));
    }

    // ── Operational errors (AppError subclasses) ───────────────────────────
    if (err.isOperational) {
        return res
            .status(err.statusCode)
            .json(
                ApiResponse.error(
                    err.message,
                    err.statusCode,
                    err.details ?? undefined
                )
            );
    }

    // ── Unknown / programmer errors ────────────────────────────────────────
    logger.error({ err, url: req.originalUrl, method: req.method }, "Unhandled error");

    const isDev = process.env.NODE_ENV !== "production";
    return res.status(500).json(
        ApiResponse.error(
            isDev ? err.message : "Internal server error",
            500,
            isDev ? { stack: err.stack } : undefined
        )
    );
}

/**
 * asyncHandler — wraps async route handlers so thrown errors
 * are forwarded to Express's error handler instead of crashing the process.
 *
 * Usage:
 *   router.get('/issues', asyncHandler(issueController.getIssues));
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
