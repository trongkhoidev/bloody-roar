import express from "express";
import multer from "multer";
import { protect } from "../../shared/middleware/auth.middleware.js";
import {
    getWorkspace,
    getWorkspaceByIssue,
    getFileContent,
    updateFile,
    runCommand,
    processUpload,
    verifyWorkspace,
} from "./workspace.controller.js";

const router = express.Router();

// Multer setup (Keeping legacy logic for local temp storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/temp"),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// ── Public (None) ────────────────────────────────────────────────────

// ── Private ──────────────────────────────────────────────────────────
router.use(protect);

router.post("/upload", upload.array("files", 100), processUpload);
router.get("/:workspaceId", getWorkspace);
router.get("/issue/:issueId", getWorkspaceByIssue);

// File operations (using regex to capture deep paths)
router.get(/^\/([^\/]+)\/file\/(.+)$/, (req, res, next) => {
    req.params.workspaceId = req.params[0];
    next();
}, getFileContent);

router.put(/^\/([^\/]+)\/file\/(.+)$/, (req, res, next) => {
    req.params.workspaceId = req.params[0];
    next();
}, updateFile);

router.post("/:workspaceId/run", runCommand);
router.post("/:workspaceId/verify", verifyWorkspace);

export default router;
