/**
 * ApiResponse — standardised response envelope for all API endpoints.
 *
 * Shape:
 *   { success: boolean, message: string, data: any, meta?: object }
 *
 * Usage in a controller:
 *   res.status(200).json(ApiResponse.ok(data, 'Issues fetched'));
 *   res.status(201).json(ApiResponse.created(newIssue, 'Issue created'));
 *   res.status(400).json(ApiResponse.error('Validation failed', 400, details));
 */
export class ApiResponse {
    constructor({ success, message, data = null, meta = undefined, statusCode = 200 }) {
        this.success = success;
        this.message = message;
        this.data = data;
        if (meta !== undefined) this.meta = meta;
        this._statusCode = statusCode; // internal — not serialised
    }

    // ── Success helpers ────────────────────────────────────────────────────────

    /**
     * 200 OK — general success.
     * @param {*}      data
     * @param {string} [message]
     * @param {object} [meta]    Pagination, totals, etc.
     */
    static ok(data, message = "Success", meta) {
        return new ApiResponse({ success: true, message, data, meta, statusCode: 200 });
    }

    /**
     * 201 Created.
     * @param {*}      data
     * @param {string} [message]
     */
    static created(data, message = "Created successfully") {
        return new ApiResponse({ success: true, message, data, statusCode: 201 });
    }

    /**
     * 204 No Content — use for DELETE responses.
     * Returns null data so Express doesn't send a body.
     */
    static noContent(message = "Deleted successfully") {
        return new ApiResponse({ success: true, message, data: null, statusCode: 204 });
    }

    // ── Error helpers ──────────────────────────────────────────────────────────

    /**
     * Error response — carries status code and optional debug details.
     * @param {string} message
     * @param {number} [statusCode]
     * @param {*}      [details]   Additional error context.
     */
    static error(message = "An error occurred", statusCode = 500, details) {
        return new ApiResponse({
            success: false,
            message,
            data: details ?? null,
            statusCode,
        });
    }

    // ── Pagination meta helper ─────────────────────────────────────────────────

    /**
     * Build a pagination meta object.
     * @param {number} page
     * @param {number} limit
     * @param {number} total
     */
    static paginationMeta(page, limit, total) {
        return {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
}
