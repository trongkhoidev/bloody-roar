import issueRepository from "./issue.repository.js";
import applicationRepository from "./application.repository.js";
import workspaceService from "../workspaces/workspace.service.js"; // Use service instead of model
import workspaceRepository from "../workspaces/workspace.repository.js";
import User from "../../shared/models/user.model.js";
import { IssueStatus, ApplicationStatus, PaymentStatus } from "@bloody-roar/shared-types";
import { domainEvents } from "../../shared/events/DomainEventEmitter.js";
import { DOMAIN_EVENTS } from "../../shared/constants/events.constants.js";
import { NotFoundError, UnauthorizedError, AppError } from "../../shared/errors/errors.js";
import { socketRegistry } from "../../shared/socket/SocketRegistry.js";
import { verifyEscrowTransaction } from "../../shared/utils/blockchain.js";

/**
 * IssueService — handles business logic for job postings and lifecycle.
 */
export class IssueService {
    async createIssue(client, data) {
        if (client.role === "ADMIN") {
            throw new UnauthorizedError("Admins cannot post issues");
        }

        const issue = await issueRepository.create({
            clientId: client._id,
            ...data,
            bounty: {
                amount: data.budget,
                currency: "ETH",
            },
        });

        // Matchmaking notifications (Async)
        this.notifyMatchingDevelopers(issue, data.tags);

        return issue;
    }

    async getIssues(filters) {
        const { category, status, minBudget, maxBudget, q, tech, page = 1, limit = 10 } = filters;
        let query = {};

        if (category) query.category = category;
        if (status) {
            if (status !== "ALL") {
                query.status = status;
            }
        } else {
            query.status = { $in: [IssueStatus.OPEN, IssueStatus.PENDING_CONFIRM] };
        }
        if (tech) {
            query.tags = tech;
        }
        if (minBudget || maxBudget) {
            query["bounty.amount"] = {};
            if (minBudget) query["bounty.amount"].$gte = Number(minBudget);
            if (maxBudget) query["bounty.amount"].$lte = Number(maxBudget);
        }
        if (q?.trim()) {
            const searchRegex = new RegExp(q.trim(), "i");
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { category: searchRegex },
                { tags: searchRegex }
            ];
        }

        const skip = (page - 1) * limit;
        const [docs, total] = await Promise.all([
            issueRepository.find(query, { createdAt: -1 }, skip, limit),
            issueRepository.count(query),
        ]);

        return { docs, total };
    }

    async getIssueById(id) {
        const issue = await issueRepository.findByIdWithPopulated(id);
        if (!issue) throw new NotFoundError("Issue");
        return issue;
    }

    /**
     * Approving an application is a critical multi-step operation.
     * Orchestrates Application, Issue, and Workspace status.
     */
    async approveApplication(clientId, clientName, clientAvatar, issueId, appId, txHash) {
        const issue = await issueRepository.findById(issueId);
        if (!issue) throw new NotFoundError("Issue");

        if (issue.clientId.toString() !== clientId.toString()) {
            throw new UnauthorizedError("Not authorized to manage this issue");
        }

        const application = await applicationRepository.findById(appId);
        if (!application) throw new NotFoundError("Application");

        // Blockchain verification
        if (txHash) {
            const isValidTx = await verifyEscrowTransaction(txHash, "Deposited", {
                issueId,
                amount: issue.bounty.amount,
            });
            if (!isValidTx) {
                throw new AppError("Invalid blockchain transaction", 400);
            }
        }

        // 1. Update Application
        await applicationRepository.updateStatus(appId, ApplicationStatus.APPROVED);

        // 2. Create Workspace
        const workspaceId = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const workspace = await workspaceRepository.create({
            issue: issue._id,
            uploadedBy: clientId,
            assignedDeveloper: application.developer,
            workspaceId,
            name: issue.title.replace(/[^a-zA-Z0-9-_ ]/g, "").substring(0, 50),
            status: "ACTIVE",
            paymentStatus: txHash ? PaymentStatus.ESCROWED : PaymentStatus.NONE,
            escrowTxHash: txHash || undefined,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        // 3. Update Issue
        issue.status = IssueStatus.ONGOING;
        issue.assignedDeveloper = application.developer;
        issue.workspace = workspace._id;
        issue.escrowTxHash = txHash;
        await issue.save();

        // 4. Cleanup other apps
        await applicationRepository.rejectOthers(issueId, appId);

        // 5. Trigger Notifications/Events
        domainEvents.emit(DOMAIN_EVENTS.ISSUE_APPROVED, {
            issueId,
            issueTitle: issue.title,
            developerId: application.developer,
            clientId,
        });

        // Real-time Chat Orchestration
        socketRegistry.emitToUser(application.developer, "chat_initiated", {
            issueId: issue._id.toString(),
            devId: application.developer.toString(),
            clientId: clientId.toString(),
            clientName,
            clientAvatar,
            issueTitle: issue.title,
        });

        return { issue, workspaceId };
    }

    async updateStatus(userId, userRole, issueId, status) {
        const issue = await issueRepository.findById(issueId);
        if (!issue) throw new NotFoundError("Issue");

        const isAdmin = userRole === "ADMIN";
        const isOwner = issue.clientId.toString() === userId.toString();
        if (!isAdmin && !isOwner) throw new UnauthorizedError();

        issue.status = status;
        return issue.save();
    }

    async deleteIssue(userId, userRole, issueId) {
        const issue = await issueRepository.findById(issueId);
        if (!issue) throw new NotFoundError("Issue");

        const isAdmin = userRole === "ADMIN";
        const isOwner = issue.clientId.toString() === userId.toString();
        if (!isAdmin && !isOwner) throw new UnauthorizedError();

        return issueRepository.deleteById(issueId);
    }

    /**
     * Matching logic for new issues.
     */
    async notifyMatchingDevelopers(issue, tags) {
        if (!tags || tags.length === 0) return;

        const developers = await User.find({
            role: "DEVELOPER",
            skills: { $in: tags },
        }).select("_id");

        // Note: For large datasets, this would be an async background task.
        developers.forEach((dev) => {
            // Internal event for JOB_MATCH logic (custom event not in shared but used here)
            domainEvents.emit("notification:direct", {
                recipient: dev._id,
                sender: issue.clientId,
                type: "JOB_MATCH",
                message: `New job posted matching your skills: "${issue.title}"`,
                link: `/issue/${issue._id}`,
            });
        });
    }
}

export default new IssueService();
