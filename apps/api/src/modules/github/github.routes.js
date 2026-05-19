import express from "express";
import {
    githubOAuthRedirect,
    githubOAuthCallback,
    getGitHubStatus,
    disconnectGitHub,
    getConnectedRepos,
    createBranch,
    commitAndPush,
    getRepoDataFromIssue,
    createPullRequest,
} from "./github.controller.js";
import { protect } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

// ── OAuth ──────────────────────────────────────────────────────────
router.get("/auth", githubOAuthRedirect);
router.get("/callback", githubOAuthCallback);
router.get("/status", protect, getGitHubStatus);
router.delete("/disconnect", protect, disconnectGitHub);

// ── Git Ops ────────────────────────────────────────────────────────
router.get("/repos", protect, getConnectedRepos);
router.post("/branch", protect, createBranch);
router.post("/commit", protect, commitAndPush);
router.post("/pr", protect, createPullRequest);
router.get("/repo-data/:issueId", protect, getRepoDataFromIssue);

export default router;
