import mongoose from "mongoose";
import Issue from "../../shared/models/issue.model.js";

/**
 * IssueRepository — handles all direct DB operations for the Issue model.
 */
export class IssueRepository {
    async findById(id) {
        return Issue.findById(id);
    }

    async findByIdWithPopulated(id) {
        return Issue.findById(id)
            .populate("clientId", "_id name avatar reputation")
            .populate("workspace", "workspaceId status")
            .populate("assignedDeveloper", "_id name avatar reputation walletAddress")
            .populate("comments");
    }

    async create(data) {
        return Issue.create(data);
    }

    async find(query, sort, skip, limit) {
        return Issue.find(query)
            .populate("clientId", "name avatar reputation")
            .populate("workspace")
            .populate("comments")
            .sort(sort)
            .skip(skip)
            .limit(limit);
    }

    async count(query) {
        return Issue.countDocuments(query);
    }

    /**
     * Get issues by client with application counts using aggregation.
     * Prevents N+1 query problem.
     */
    async getClientIssuesWithAppCount(clientId) {
        return Issue.aggregate([
            { $match: { clientId: new mongoose.Types.ObjectId(clientId) } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "applications",
                    localField: "_id",
                    foreignField: "issue",
                    as: "applications",
                },
            },
            {
                $addFields: { applicationCount: { $size: "$applications" } },
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "issueId",
                    as: "comments",
                },
            },
            { $project: { applications: 0 } },
        ]);
    }

    async deleteById(id) {
        return Issue.findByIdAndDelete(id);
    }
}

export default new IssueRepository();
