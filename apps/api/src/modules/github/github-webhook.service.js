import crypto from "crypto";
import Workspace from "../../shared/models/workspace.model.js";
import Issue from "../../shared/models/issue.model.js";
import Audit from "../../shared/models/audit.model.js";
import { domainEvents } from "../../shared/events/DomainEventEmitter.js";
import { DOMAIN_EVENTS } from "../../shared/constants/events.constants.js";
import { IssueStatus } from "@bloody-roar/shared-types";
import logger from "../../shared/logger/logger.js";

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

/**
 * GitHubWebhookService — handles incoming GitHub webhook payloads.
 */
export class GitHubWebhookService {
    /**
     * Verify GitHub signature.
     */
    verifySignature(payload, signature) {
        if (!WEBHOOK_SECRET) return true;
        const sig = crypto.createHmac("sha256", WEBHOOK_SECRET).update(payload).digest("hex");
        return crypto.timingSafeEqual(Buffer.from(`sha256=${sig}`), Buffer.from(signature));
    }

    /**
     * Entry point for webhook processing.
     */
    async handleEvent(event, payload) {
        logger.info({ event }, "📩 GitHub Webhook event received");

        if (event === "pull_request") {
            await this.handlePullRequest(payload);
        }
        // Add other events here (e.g. push, check_run)
    }

    /**
     * Handle PR events: merged/closed.
     */
    async handlePullRequest(payload) {
        const { action, pull_request: pr } = payload;
        const prNumber = pr.number;
        const repoFullName = payload.repository.full_name;

        const workspace = await Workspace.findOne({
            "githubRepo.fullName": repoFullName,
            "pullRequest.number": prNumber,
        });

        if (!workspace) {
            logger.debug({ prNumber, repoFullName }, "No workspace found for PR webhook");
            return;
        }

        if (action === "closed" && pr.merged) {
            // ── PR MERGED ───────────────────────────────────────────────────
            workspace.pullRequest.state = "merged";
            workspace.pullRequest.mergedAt = new Date(pr.merged_at);
            workspace.status = "ARCHIVED";
            await workspace.save();

            const issue = await Issue.findByIdAndUpdate(
                workspace.issue,
                { status: IssueStatus.COMPLETED, isPrMerged: true },
                { new: true }
            );

            await Audit.create({
                action: "PR_MERGE",
                actor: workspace.assignedDeveloper,
                issue: workspace.issue,
                workspace: workspace._id,
                metadata: { prNumber, prUrl: pr.html_url, mergedBy: pr.merged_by?.login },
            });

            // ── Trigger Domain Events for Notifications ───────────────────────
            // These would be listened to by NotificationService
            domainEvents.emit(DOMAIN_EVENTS.GITHUB_PR_MERGED, {
                issueId: workspace.issue,
                issueTitle: issue?.title,
                developerId: workspace.assignedDeveloper,
                clientId: issue?.clientId,
                prNumber,
            });

            logger.info({ prNumber, issueId: workspace.issue }, "✅ PR merged and issue completed");
        } else if (action === "closed" && !pr.merged) {
            workspace.pullRequest.state = "closed";
            await workspace.save();
            logger.info({ prNumber }, "❌ PR closed without merge");
        }
    }
}

export default new GitHubWebhookService();
