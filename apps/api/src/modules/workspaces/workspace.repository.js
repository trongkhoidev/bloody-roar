import Workspace from "../../shared/models/workspace.model.js";

/**
 * WorkspaceRepository — handles direct DB access for workplaces.
 */
export class WorkspaceRepository {
    async findById(workspaceId) {
        return Workspace.findOne({ workspaceId });
    }

    async findByIssueId(issueId) {
        return Workspace.findOne({ issue: issueId, status: { $ne: "DELETED" } });
    }

    async countActiveByUserId(userId) {
        return Workspace.countDocuments({ uploadedBy: userId, status: "ACTIVE" });
    }

    async create(data) {
        return Workspace.create(data);
    }

    async deleteOne(workspaceId) {
        return Workspace.deleteOne({ workspaceId });
    }

    async findByIdWithPopulated(workspaceId) {
        return Workspace.findOne({ workspaceId })
            .select("-files.content")
            .populate("assignedDeveloper", "name email avatar github.username")
            .populate("issue", "title status bounty clientId");
    }

    async findByIssueWithPopulated(issueId) {
        return Workspace.findOne({ issue: issueId, status: { $ne: "DELETED" } })
            .select("-files.content")
            .populate("assignedDeveloper", "name email avatar github.username")
            .populate("issue", "title status bounty clientId");
    }
}

export default new WorkspaceRepository();
