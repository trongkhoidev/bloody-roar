import Issue from "../../shared/models/issue.model.js";
import Workspace from "../../shared/models/workspace.model.js";
import User from "../../shared/models/user.model.js";
import Audit from "../../shared/models/audit.model.js";
import { verifyEscrowTransaction } from "../../shared/utils/blockchain.js";
import { IssueStatus, PaymentStatus } from "@bloody-roar/shared-types";
import { domainEvents } from "../../shared/events/DomainEventEmitter.js";
import { DOMAIN_EVENTS } from "../../shared/constants/events.constants.js";
import { NotFoundError, UnauthorizedError, AppError } from "../../shared/errors/errors.js";

/**
 * EscrowService — handles trustless payment logic and blockchain verification.
 */
export class EscrowService {
    /**
     * Record a deposit on chain.
     */
    async recordDeposit(userId, issueId, txHash) {
        const issue = await Issue.findById(issueId);
        if (!issue) throw new NotFoundError("Issue");

        if (issue.clientId.toString() !== userId.toString()) {
            throw new UnauthorizedError("Only issue owner can record deposit");
        }

        if (issue.bounty.isEscrowed && issue.escrowTxHash) {
            throw new AppError("Escrow already recorded", 400);
        }

        const isValid = await verifyEscrowTransaction(txHash, "Deposited", {
            issueId,
            amount: issue.bounty.amount,
        });
        if (!isValid) throw new AppError("Invalid blockchain transaction", 400);

        issue.escrowTxHash = txHash;
        issue.bounty.isEscrowed = true;
        issue.status = IssueStatus.ONGOING;
        await issue.save();

        await Workspace.findOneAndUpdate({ issue: issueId }, { paymentStatus: PaymentStatus.ESCROWED, escrowTxHash: txHash });

        await Audit.create({
            action: "ESCROW_DEPOSIT",
            actor: userId,
            issue: issueId,
            metadata: { txHash, amount: issue.bounty.amount },
        });

        domainEvents.emit(DOMAIN_EVENTS.ESCROW_DEPOSITED, {
            issueId,
            issueTitle: issue.title,
            developerId: issue.assignedDeveloper,
            clientId: userId,
        });

        return true;
    }

    /**
     * Record a release on chain.
     */
    async recordRelease(userId, issueId, txHash) {
        const issue = await Issue.findById(issueId);
        if (!issue) throw new NotFoundError("Issue");

        if (issue.clientId.toString() !== userId.toString()) {
            throw new UnauthorizedError("Only owner can release funds");
        }

        const isValid = await verifyEscrowTransaction(txHash, "Released", { issueId });
        if (!isValid) throw new AppError("Invalid blockchain transaction", 400);

        const workspace = await Workspace.findOneAndUpdate(
            { issue: issueId },
            { paymentStatus: PaymentStatus.RELEASED, releaseTxHash: txHash },
            { new: true }
        );

        issue.status = IssueStatus.COMPLETED;
        await issue.save();

        // Update developer earnings
        if (workspace?.assignedDeveloper) {
            await User.findByIdAndUpdate(workspace.assignedDeveloper, {
                $inc: { totalEarnings: issue.bounty.amount, jobsCompleted: 1 },
            });

            domainEvents.emit(DOMAIN_EVENTS.ESCROW_RELEASED, {
                issueId,
                issueTitle: issue.title,
                developerId: workspace.assignedDeveloper,
                clientId: userId,
            });
        }

        await Audit.create({
            action: "ESCROW_RELEASE",
            actor: userId,
            issue: issueId,
            metadata: { txHash, amount: issue.bounty.amount },
        });

        return true;
    }

    /**
     * Raise a dispute based on on-chain state.
     */
    async raiseDispute(userId, issueId, txHash) {
        const issue = await Issue.findById(issueId);
        if (!issue) throw new NotFoundError("Issue");

        if (txHash) {
            const isValid = await verifyEscrowTransaction(txHash, "Disputed", { issueId });
            if (!isValid) throw new AppError("Dispute transaction invalid", 400);
        }

        const workspace = await Workspace.findOneAndUpdate({ issue: issueId }, { paymentStatus: PaymentStatus.DISPUTED }, { new: true });

        await Audit.create({
            action: "ESCROW_DISPUTE",
            actor: userId,
            issue: issueId,
            metadata: { txHash },
        });

        return workspace;
    }

    /**
     * Resolve a dispute (Admin only).
     */
    async resolveDispute(adminId, issueId, refundClient, txHash) {
        const expectedEvent = refundClient ? "Refunded" : "Released";
        const isValid = await verifyEscrowTransaction(txHash, expectedEvent, { issueId });
        if (!isValid) throw new AppError(`Resolution transaction invalid. Expected: ${expectedEvent}`, 400);

        const newStatus = refundClient ? PaymentStatus.REFUNDED : PaymentStatus.RELEASED;
        await Workspace.findOneAndUpdate({ issue: issueId }, { paymentStatus: newStatus });

        await Audit.create({
            action: "ESCROW_RESOLVED",
            actor: adminId,
            issue: issueId,
            metadata: { txHash, resolution: newStatus },
        });

        return newStatus;
    }
}

export default new EscrowService();
