import { z } from "zod";
import { ApiResponse } from "../response/ApiResponse.js";

/**
 * validate — Zod-powered request validation middleware factory.
 *
 * Usage:
 *   router.post('/register', validate(authSchema.register), authController.register);
 *
 * @param {z.ZodSchema} schema   Zod object schema. Can validate body, query, params.
 * @param {'body'|'query'|'params'} [source='body']
 */
export function validate(schema, source = "body") {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const details = result.error.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            }));
            return res
                .status(400)
                .json(ApiResponse.error("Validation failed", 400, details));
        }

        req[source] = result.data; // replace with parsed + sanitised data
        next();
    };
}

// ── Reusable common schemas ────────────────────────────────────────────────

export const commonSchemas = {
    /** MongoDB ObjectId string */
    objectId: z
        .string()
        .regex(/^[a-f\d]{24}$/i, "Invalid ID format"),

    /** Pagination query params */
    pagination: z.object({
        page: z
            .string()
            .optional()
            .transform((v) => (v ? parseInt(v, 10) : 1))
            .pipe(z.number().min(1)),
        limit: z
            .string()
            .optional()
            .transform((v) => (v ? parseInt(v, 10) : 20))
            .pipe(z.number().min(1).max(50)),
        q: z.string().optional(),
    }),
};
