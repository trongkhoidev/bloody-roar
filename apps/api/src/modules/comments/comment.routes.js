import express from "express";
import {
    createComment,
    getComments,
    updateComment,
    deleteComment,
} from "./comment.controller.js";
import { protect } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/validation/validate.middleware.js";
import { z } from "zod";

const router = express.Router();

const commentSchema = z.object({
    content: z.string().min(1, "Comment content is required").max(1000),
    parentId: z.string().regex(/^[a-f\d]{24}$/i).optional().nullable(),
    attachments: z.array(z.string()).optional(),
});

// ── Endpoints mapped to /api/issues/:id/comments ────────────────────
// These are mounted under /api in app.js, so they match /api/issues/:id/comments

/**
 * @route POST /api/issues/:id/comments
 */
router.post("/issues/:id/comments", protect, validate(commentSchema), createComment);

/**
 * @route GET /api/issues/:id/comments
 */
router.get("/issues/:id/comments", getComments);

// ── Endpoints mapped to /api/comments/:id ───────────────────────────
// These will be mounted in app.js as: app.use("/api/comments", commentRoutes);

/**
 * @route PATCH /api/comments/:id
 */
router.patch("/comments/:id", protect, validate(z.object({ content: z.string().min(1) })), updateComment);

/**
 * @route DELETE /api/comments/:id
 */
router.delete("/comments/:id", protect, deleteComment);

export default router;
