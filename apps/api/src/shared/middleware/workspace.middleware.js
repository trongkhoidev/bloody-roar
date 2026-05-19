import Workspace from '../models/workspace.model.js';
import Issue from '../models/issue.model.js';

// Check if user has access to a workspace (developer or client of the issue)
export const checkWorkspaceAccess = async (req, res, next) => {
    try {
        const workspaceId = req.params.workspaceId || req.body.workspaceId;
        if (!workspaceId) return res.status(400).json({ message: 'workspaceId required' });

        const workspace = await Workspace.findOne({ workspaceId });
        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

        const userId = req.user._id.toString();
        const isAssignedDev = workspace.assignedDeveloper?.toString() === userId;
        const isUploader = workspace.uploadedBy?.toString() === userId;

        // Also check if user is the client of the issue
        const issue = await Issue.findById(workspace.issue).select('clientId');
        const isClient = issue?.clientId?.toString() === userId;

        if (!isAssignedDev && !isUploader && !isClient && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied to this workspace' });
        }

        req.workspace = workspace;
        req.workspaceIssue = issue;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Check workspace is active
export const checkWorkspaceActive = (req, res, next) => {
    if (req.workspace && req.workspace.status !== 'ACTIVE') {
        return res.status(400).json({
            message: `Workspace is ${req.workspace.status.toLowerCase()}, cannot modify`
        });
    }
    next();
};
