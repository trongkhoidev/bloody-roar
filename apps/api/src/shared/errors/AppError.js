/**
 * AppError — custom error class that carries HTTP status codes.
 * All operational errors should extend or use this class so the global
 * error-handler can distinguish them from unexpected crashes.
 */
export class AppError extends Error {
    /**
     * @param {string} message   Human-readable error message.
     * @param {number} statusCode HTTP status code (default 500).
     * @param {string} [code]    Optional machine-readable error code.
     */
    constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;  // marks as known/expected error

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
