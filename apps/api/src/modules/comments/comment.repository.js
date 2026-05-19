import Comment from "../../shared/models/comment.model.js";

/**
 * CommentRepository — handles all database operations for comments.
 */
export class CommentRepository {
    /**
     * Find a comment by ID.
     * @param {string} id
     */
    async findById(id) {
        return Comment.findById(id);
    }

    /**
     * Create a new comment.
     * @param {Object} data
     */
    async create(data) {
        return Comment.create(data);
    }

    /**
     * Get comments for an issue.
     * @param {string} issueId
     * @param {boolean} isParent - Fetch parents or replies.
     */
    async getIssueComments(issueId, isParent = true) {
        const query = {
            issueId,
            parentId: isParent ? null : { $ne: null },
        };

        const sort = isParent ? { createdAt: -1 } : { createdAt: 1 };

        return Comment.find(query)
            .populate("userId", "name avatar email")
            .sort(sort)
            .lean();
    }

    /**
     * Delete a comment and its replies.
     * @param {string} commentId
     */
    async deleteWithReplies(commentId) {
        await Comment.deleteMany({ parentId: commentId });
        return Comment.findByIdAndDelete(commentId);
    }
}

export default new CommentRepository();
