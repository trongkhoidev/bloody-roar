import escrowService from "./escrow.service.js";
import Issue from "../../shared/models/issue.model.js";
import Workspace from "../../shared/models/workspace.model.js";
import { asyncHandler } from "../../shared/middleware/errorHandler.middleware.js";
import { ApiResponse } from "../../shared/response/ApiResponse.js";
import disputeAssistantService from "./dispute-assistant.service.js";

/**
 * EscrowController — mapping HTTP requests to escrow service operations.
 */
export const getEscrowStatus = asyncHandler(async (req, res) => {
    const issue = await Issue.findById(req.params.issueId).select("bounty escrowTxHash status");
    const workspace = await Workspace.findOne({ issue: req.params.issueId }).select("paymentStatus escrowTxHash releaseTxHash");

    res.status(200).json(ApiResponse.ok({
        bounty: issue?.bounty,
        escrowTxHash: issue?.escrowTxHash,
        paymentStatus: workspace?.paymentStatus || "NONE",
        releaseTxHash: workspace?.releaseTxHash,
    }));
});

export const recordDeposit = asyncHandler(async (req, res) => {
    const { issueId, txHash } = req.body;
    await escrowService.recordDeposit(req.user._id, issueId, txHash);
    res.status(200).json(ApiResponse.ok(null, "Deposit recorded successfully"));
});

export const recordRelease = asyncHandler(async (req, res) => {
    const { issueId, txHash } = req.body;
    await escrowService.recordRelease(req.user._id, issueId, txHash);
    res.status(200).json(ApiResponse.ok(null, "Payment released successfully"));
});

export const raiseDispute = asyncHandler(async (req, res) => {
    const { issueId, txHash } = req.body;
    const result = await escrowService.raiseDispute(req.user._id, issueId, txHash);
    res.status(200).json(ApiResponse.ok(result, "Dispute raised"));
});

export const resolveDispute = asyncHandler(async (req, res) => {
    if (req.user.role !== "ADMIN") return res.status(403).json(ApiResponse.error("Admin only"));
    const { issueId, refundClient, txHash } = req.body;
    const result = await escrowService.resolveDispute(req.user._id, issueId, refundClient, txHash);
    res.status(200).json(ApiResponse.ok({ status: result }, "Dispute resolved"));
});

export const getDisputeDossier = asyncHandler(async (req, res) => {
    if (req.user.role !== "ADMIN") return res.status(403).json(ApiResponse.error("Admin only"));
    const dossier = await disputeAssistantService.generateDossier(req.params.issueId);
    res.status(200).json(ApiResponse.ok(dossier, "Dispute dossier generated successfully"));
});
