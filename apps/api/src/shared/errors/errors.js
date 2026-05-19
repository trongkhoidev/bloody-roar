import { AppError } from "./AppError.js";
export { AppError };

/**
 * 400 Bad Request — invalid request data.
 */
export class ValidationError extends AppError {
    constructor(message = "Validation failed", details = []) {
        super(message, 400, "VALIDATION_ERROR");
        this.details = details; // array of { field, message }
    }
}

/**
 * 401 Unauthorized — missing or invalid credentials.
 */
export class UnauthorizedError extends AppError {
    constructor(message = "Authentication required") {
        super(message, 401, "UNAUTHORIZED");
    }
}

/**
 * 403 Forbidden — authenticated but lacks permission.
 */
export class ForbiddenError extends AppError {
    constructor(message = "You do not have permission to perform this action") {
        super(message, 403, "FORBIDDEN");
    }
}

/**
 * 404 Not Found — resource does not exist.
 */
export class NotFoundError extends AppError {
    constructor(resource = "Resource") {
        super(`${resource} not found`, 404, "NOT_FOUND");
    }
}

/**
 * 409 Conflict — state conflict (e.g. duplicate, already applied).
 */
export class ConflictError extends AppError {
    constructor(message = "Conflict with current state") {
        super(message, 409, "CONFLICT");
    }
}

/**
 * 429 Too Many Requests — rate limit exceeded.
 */
export class RateLimitError extends AppError {
    constructor(message = "Too many requests, please try again later") {
        super(message, 429, "RATE_LIMIT_EXCEEDED");
    }
}
