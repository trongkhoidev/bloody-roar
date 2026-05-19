import path from "path";
import fs from "fs-extra";
import { exec } from "child_process";
import { promisify } from "util";
import workspaceRepository from "./workspace.repository.js";
import { extractZip, buildFileTree, detectLanguage, cleanupWorkspace } from "../../shared/utils/zipHandler.js";
import { scanContent } from "../../shared/utils/aiScanner.js";
import dockerService from "../../shared/utils/dockerService.js";
import blockchain from "../../shared/utils/blockchain.js";
import Issue from "../../shared/models/issue.model.js";
import { NotFoundError, AppError, UnauthorizedError, ConflictError } from "../../shared/errors/errors.js";
import { WorkspaceStatus, PaymentStatus, IssueStatus } from "@bloody-roar/shared-types";
import Audit from "../../shared/models/audit.model.js";

const execAsync = promisify(exec);
const WORKSPACES_DIR = "uploads/workspaces";

/**
 * WorkspaceService — handles workspace lifecycle, files, and terminal execution.
 */
export class WorkspaceService {
    constructor(repository) {
        this.repository = repository;
    }

    /**
     * Get a workspace by ID.
     */
    async getWorkspace(workspaceId) {
        const workspace = await this.repository.findByIdWithPopulated(workspaceId);
        if (!workspace) throw new NotFoundError("Workspace");
        return workspace;
    }

    /**
     * Get a workspace by Issue ID.
     */
    async getWorkspaceByIssue(issueId) {
        const workspace = await this.repository.findByIssueWithPopulated(issueId);
        if (!workspace) throw new NotFoundError("Workspace for this issue");
        return workspace;
    }

    /**
     * Get a specific file's content with Asymmetric Visibility control.
     */
    async getFileContent(userId, workspaceId, filePath) {
        const workspace = await this.repository.findById(workspaceId);
        if (!workspace) throw new NotFoundError("Workspace");

        const file = workspace.files.find((f) => f.path === filePath);
        if (!file) throw new NotFoundError("File");

        let content = file.content;

        // Asymmetric Visibility check: Hide file content from Client if workspace is still active/ongoing
        const issue = await Issue.findById(workspace.issue);
        if (issue && issue.clientId.toString() === userId.toString()) {
            const isOngoing = issue.status !== IssueStatus.COMPLETED && workspace.paymentStatus !== PaymentStatus.RELEASED;
            if (isOngoing) {
                content = `// 🛡️ [ASYMMETRIC VISIBILITY ENABLED]
// Source code is hidden from the client until verification passes or payment is released.
//
// Verification Status: PENDING`;
            }
        }

        return {
            path: file.path,
            content: content,
            language: file.language,
            size: Buffer.byteLength(content, "utf8"),
            updatedAt: workspace.updatedAt,
        };
    }

    /**
     * Update a file's content with conflict detection.
     */
    async updateFile(userId, workspaceId, filePath, content, lastKnownUpdate) {
        const workspace = await this.repository.findById(workspaceId);
        if (!workspace) throw new NotFoundError("Workspace");

        // Conflict detection
        if (lastKnownUpdate && workspace.updatedAt && new Date(lastKnownUpdate) < workspace.updatedAt) {
            throw new ConflictError("File was modified by another session. Reload and try again.");
        }

        const fileIndex = workspace.files.findIndex((f) => f.path === filePath);
        if (fileIndex === -1) throw new NotFoundError("File");

        workspace.files[fileIndex].content = content;
        workspace.files[fileIndex].size = Buffer.byteLength(content, "utf8");
        await workspace.save();

        return {
            path: filePath,
            size: workspace.files[fileIndex].size,
            updatedAt: workspace.updatedAt,
        };
    }

    /**
     * Execute a sandboxed terminal command.
     */
    async runCommand(userId, workspaceId, command) {
        const workspace = await this.repository.findById(workspaceId);
        if (!workspace) throw new NotFoundError("Workspace");

        const workspaceDir = path.join(WORKSPACES_DIR, workspace.workspaceId);

        try {
            // Execute safely inside the MRE Docker container
            const result = await dockerService.execute(workspace.workspaceId, command, workspaceDir);

            // Audit log
            await Audit.create({
                action: "TERMINAL_COMMAND",
                actor: userId,
                issue: workspace.issue,
                metadata: { command, exitCode: result.exitCode },
            });

            return result;
        } catch (error) {
            return {
                output: "",
                error: error.message,
                exitCode: 1,
            };
        }
    }

    /**
     * Upload logic (Refactored from route)
     */
    async processUpload(userId, issueId, files) {
        const activeCount = await this.repository.countActiveByUserId(userId);
        if (activeCount >= 3) {
            throw new AppError("Maximum 3 active workspaces allowed.", 400);
        }

        const workspaceId = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const workspaceDir = path.join(WORKSPACES_DIR, workspaceId);

        let extractedFiles = [];
        let workspaceName = "";

        // logic for extraction moved from route to keep service clean
        if (files.length === 1 && this.isArchive(files[0])) {
            const archiveFile = files[0];
            workspaceName = archiveFile.originalname.replace(/\.(zip|tar\.gz|tgz|gz|bz2|7z|rar)$/i, "");
            const extracted = await extractZip(archiveFile.path, workspaceDir, {
                maxFiles: 500,
                maxFileSize: 10 * 1024 * 1024,
            });
            extractedFiles = extracted.files;
        } else {
            workspaceName = `workspace-${new Date().toISOString().slice(0, 10)}`;
            extractedFiles = await this.processIndividualFiles(files);
            await fs.ensureDir(workspaceDir);
        }

        // AI Scan
        const flaggedFiles = extractedFiles
            .map((f) => ({ path: f.path, result: scanContent(f.content) }))
            .filter((r) => r.result.flagged)
            .map((r) => ({ path: r.path, reason: r.result.reason }));

        const totalSize = extractedFiles.reduce((sum, f) => sum + (f.size || 0), 0);

        const workspace = await this.repository.create({
            issue: issueId,
            uploadedBy: userId,
            workspaceId,
            name: workspaceName,
            files: extractedFiles,
            fileCount: extractedFiles.length,
            totalSize,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return {
            workspaceId: workspace.workspaceId,
            name: workspace.name,
            fileTree: buildFileTree(extractedFiles),
            flaggedFiles: flaggedFiles.length > 0 ? flaggedFiles : undefined,
        };
    }

    // Helpers
    isArchive(file) {
        const ext = path.extname(file.originalname).toLowerCase();
        return [".zip", ".tar", ".gz", ".tgz", ".bz2", ".7z", ".rar"].includes(ext);
    }

    async processIndividualFiles(files) {
        const result = [];
        const ignorePatterns = [/node_modules/, /\.git/, /\.DS_Store/, /\.env$/, /\.log$/, /dist\//, /build\//, /\.next\//, /__pycache__/, /\.pyc$/, /\.class$/, /\.exe$/];
        for (const file of files) {
            const relPath = file.originalname;
            if (ignorePatterns.some((p) => p.test(relPath))) continue;
            const content = await fs.readFile(file.path, "utf8").catch(() => "[binary file]");
            result.push({
                path: relPath,
                content,
                language: detectLanguage(relPath),
                size: file.size,
            });
        }
        return result;
    }

    /**
     * Verify the workspace by running dynamic automated tests inside the Docker container
     * and automatically trigger the Oracle Web3 relayer to release funds on-chain if they pass.
     */
    async verifyWorkspace(workspaceId) {
        const workspace = await this.repository.findById(workspaceId);
        if (!workspace) throw new NotFoundError("Workspace");

        const workspaceDir = path.join(WORKSPACES_DIR, workspace.workspaceId);

        console.log(`🧪 Running automated tests in Sandbox container for workspace: ${workspaceId}...`);
        
        // Execute the test script. Note: we default to "npm test"
        const testResult = await dockerService.execute(workspace.workspaceId, "npm test", workspaceDir);

        if (testResult.exitCode !== 0) {
            console.warn(`❌ Sandbox verification tests failed for ${workspaceId} with exit code ${testResult.exitCode}.`);
            return {
                success: false,
                output: testResult.output,
                error: testResult.error || "Tests failed inside the sandbox.",
            };
        }

        console.log(`✅ Sandbox verification tests passed for ${workspaceId}. Activating Oracle Relayer...`);

        // Update database: Workspace status/payment status
        workspace.paymentStatus = PaymentStatus.RELEASED;
        
        // Fetch and update the related Issue
        const issue = await Issue.findById(workspace.issue);
        if (issue) {
            issue.status = IssueStatus.COMPLETED;
            await issue.save();
        }

        // Trigger on-chain payment via the Web3 Oracle Relayer
        let txHash = "";
        try {
            const relayerResult = await blockchain.triggerOracleRelease(workspace.issue.toString());
            if (relayerResult && relayerResult.txHash) {
                txHash = relayerResult.txHash;
                workspace.releaseTxHash = txHash;
            }
        } catch (blockchainError) {
            console.error("⚠️ Oracle Relayer transaction failed, but tests passed and issue was completed locally:", blockchainError.message);
        }

        await workspace.save();

        return {
            success: true,
            output: testResult.output,
            txHash,
        };
    }
}

export default new WorkspaceService(workspaceRepository);
