import issueService from "./issue.service.js";
import applicationService from "./application.service.js";
import issueRepository from "./issue.repository.js";
import { asyncHandler } from "../../shared/middleware/errorHandler.middleware.js";
import { ApiResponse } from "../../shared/response/ApiResponse.js";

/**
 * IssueController — unified HTTP entry point for Issues and Applications.
 */
export const createIssue = asyncHandler(async (req, res) => {
    const issue = await issueService.createIssue(req.user, req.body);
    res.status(201).json(ApiResponse.created(issue, "Issue created successfully"));
});

export const getIssues = asyncHandler(async (req, res) => {
    const { docs, total } = await issueService.getIssues(req.query);
    res.status(200).json(ApiResponse.ok(docs, "Issues fetched", {
         total,
         page: parseInt(req.query.page) || 1,
         limit: parseInt(req.query.limit) || 10
    }));
});

export const getIssueById = asyncHandler(async (req, res) => {
    const issue = await issueService.getIssueById(req.params.id);
    res.status(200).json(ApiResponse.ok(issue));
});

export const applyForIssue = asyncHandler(async (req, res) => {
    const application = await applicationService.applyForIssue(req.user, req.params.id, req.body);
    res.status(201).json(ApiResponse.created(application, "Application submitted"));
});

export const approveApplication = asyncHandler(async (req, res) => {
    const { id, appId } = req.params;
    const { txHash } = req.body;
    const result = await issueService.approveApplication(
        req.user._id,
        req.user.name,
        req.user.avatar,
        id,
        appId,
        txHash
    );
    res.status(200).json(ApiResponse.ok(result, "Application approved and workspace created"));
});

export const getMyIssues = asyncHandler(async (req, res) => {
    const issues = await issueRepository.getClientIssuesWithAppCount(req.user._id);
    res.status(200).json(ApiResponse.ok(issues));
});

export const getMyApplications = asyncHandler(async (req, res) => {
    const applications = await applicationService.getDeveloperApplications(req.user._id);
    res.status(200).json(ApiResponse.ok(applications));
});

export const getIssueApplications = asyncHandler(async (req, res) => {
    const applications = await applicationService.getIssueApplications(req.user._id, req.params.id);
    res.status(200).json(ApiResponse.ok(applications));
});

export const deleteIssue = asyncHandler(async (req, res) => {
    await issueService.deleteIssue(req.user._id, req.user.role, req.params.id);
    res.status(200).json(ApiResponse.ok(null, "Issue deleted"));
});

export const updateIssueStatus = asyncHandler(async (req, res) => {
    const issue = await issueService.updateStatus(req.user._id, req.user.role, req.params.id, req.body.status);
    res.status(200).json(ApiResponse.ok(issue, "Issue status updated"));
});
