import Application from "../../shared/models/application.model.js";

/**
 * ApplicationRepository — handles all DB operations for the Application model.
 */
export class ApplicationRepository {
    async findById(id) {
        return Application.findById(id);
    }

    async findOne(query) {
        return Application.findOne(query);
    }

    async create(data) {
        return Application.create(data);
    }

    async findByDeveloper(developerId) {
        return Application.find({ developer: developerId })
            .populate({
                path: "issue",
                populate: [
                    { path: "clientId", select: "name avatar" },
                    { path: "workspace", select: "workspaceId status" },
                ],
            })
            .sort({ createdAt: -1 });
    }

    async findByIssue(issueId) {
        return Application.find({ issue: issueId })
            .populate("developer", "name avatar reputation skills githubUrl walletAddress")
            .sort({ createdAt: -1 });
    }

    async updateStatus(id, status) {
        return Application.findByIdAndUpdate(id, { status }, { new: true });
    }

    async rejectOthers(issueId, acceptedAppId) {
        return Application.updateMany(
            { issue: issueId, _id: { $ne: acceptedAppId }, status: "PENDING" },
            { status: "REJECTED" }
        );
    }
}

export default new ApplicationRepository();
