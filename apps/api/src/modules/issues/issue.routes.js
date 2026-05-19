import express from "express";
import {
    createIssue,
    getIssues,
    getIssueById,
    applyForIssue,
    approveApplication,
    getMyIssues,
    getMyApplications,
    getIssueApplications,
    deleteIssue,
    updateIssueStatus,
} from "./issue.controller.js";
import { protect } from "../../shared/middleware/auth.middleware.js";
import { validate, commonSchemas } from "../../shared/validation/validate.middleware.js";
import { z } from "zod";

const router = express.Router();

const issueSchema = z.object({
    title: z.string().min(5).max(100),
    description: z.string().min(20),
    category: z.string(),
    budget: z.number().positive(),
    githubRepoUrl: z.string().url().regex(/github\.com/),
    tags: z.array(z.string()).optional(),
    attachments: z.array(z.string()).optional(),
});

// ── Public ──────────────────────────────────────────────────────────
router.get("/", getIssues);
router.get("/:id", validate(z.object({ id: commonSchemas.objectId }), "params"), getIssueById);

// ── Private ─────────────────────────────────────────────────────────
router.use(protect);

router.post("/", validate(issueSchema), createIssue);
router.get("/client/my-issues", getMyIssues);
router.get("/developer/my-applications", getMyApplications);

router.post("/:id/apply", validate(z.object({ id: commonSchemas.objectId }), "params"), applyForIssue);
router.get("/:id/applications", validate(z.object({ id: commonSchemas.objectId }), "params"), getIssueApplications);
router.post("/:id/approve/:appId", approveApplication);

router.patch("/:id/status", validate(z.object({ status: z.string() })), updateIssueStatus);
router.delete("/:id", deleteIssue);

export default router;
