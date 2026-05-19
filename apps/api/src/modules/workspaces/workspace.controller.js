import workspaceService from "./workspace.service.js";
import { asyncHandler } from "../../shared/middleware/errorHandler.middleware.js";
import { ApiResponse } from "../../shared/response/ApiResponse.js";

/**
 * WorkspaceController — mapping HTTP requests to WorkspaceService operations.
 */
export const getWorkspace = asyncHandler(async (req, res) => {
    const workspace = await workspaceService.getWorkspace(req.params.workspaceId);
    res.status(200).json(ApiResponse.ok(workspace));
});

export const getWorkspaceByIssue = asyncHandler(async (req, res) => {
    const workspace = await workspaceService.getWorkspaceByIssue(req.params.issueId);
    res.status(200).json(ApiResponse.ok(workspace));
});

export const getFileContent = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const filePath = req.params[0]; // from regex capture
    const result = await workspaceService.getFileContent(req.user._id, workspaceId, filePath);
    res.status(200).json(ApiResponse.ok(result));
});

export const updateFile = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const filePath = req.params[0];
    const { content, lastKnownUpdate } = req.body;
    const result = await workspaceService.updateFile(req.user._id, workspaceId, filePath, content, lastKnownUpdate);
    res.status(200).json(ApiResponse.ok(result, "File updated"));
});

export const runCommand = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const { command } = req.body;
    const result = await workspaceService.runCommand(req.user._id, workspaceId, command);
    res.status(200).json(ApiResponse.ok(result));
});

export const processUpload = asyncHandler(async (req, res) => {
    const { issueId, userId } = req.body;
    const result = await workspaceService.processUpload(userId, issueId, req.files);
    res.status(201).json(ApiResponse.created(result, "Workspace uploaded and processed"));
});

export const verifyWorkspace = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const result = await workspaceService.verifyWorkspace(workspaceId);
    res.status(200).json(ApiResponse.ok(result));
});
