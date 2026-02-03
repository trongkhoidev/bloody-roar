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
    updateIssueStatus
} from "../controllers/issue.controller.js";
import { handleGithubWebhook } from "../controllers/webhook.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/client/my-issues", protect, getMyIssues);
router.get("/developer/my-applications", protect, getMyApplications);
router.get("/:id/applications", protect, getIssueApplications);
router.post("/:id/approve/:appId", protect, approveApplication);

// Webhook (Public)
router.post("/webhooks/github", handleGithubWebhook);

router.route("/")
    .post(protect, createIssue)
    .get(getIssues);

router.route("/:id")
    .get(getIssueById)
    .delete(protect, deleteIssue);

router.post("/:id/apply", protect, applyForIssue);
router.patch("/:id/status", protect, updateIssueStatus);

export default router;
