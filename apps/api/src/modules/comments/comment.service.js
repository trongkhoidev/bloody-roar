import commentRepository from "./comment.repository.js";
import Issue from "../../shared/models/issue.model.js";
import { domainEvents } from "../../shared/events/DomainEventEmitter.js";
import { DOMAIN_EVENTS } from "../../shared/constants/events.constants.js";
import { NotFoundError, UnauthorizedError } from "../../shared/errors/errors.js";

/**
 * CommentService — handles commenting logic and grouping replies.
 */
export class CommentService {
    constructor(repository) {
        this.repository = repository;
    }

    /**
     * Create a comment and trigger domain events for notifications.
     */
    async createComment(userId, userName, issueId, data) {
        const { content, attachments, parentId } = data;

        // Verify issue exists
        const issue = await Issue.findById(issueId);
        if (!issue) throw new NotFoundError("Issue");

        const comment = await this.repository.create({
            issueId,
            userId,
            content,
            attachments: attachments || [],
            parentId: parentId || null,
        });

        await comment.populate("userId", "name avatar email");

        // ── Emit Domain Events for Notifications ───────────────────────────
        
        // 1. Notify Issue Owner
        if (issue.clientId.toString() !== userId.toString()) {
            domainEvents.emit(DOMAIN_EVENTS.COMMENT_CREATED, {
                recipientId: issue.clientId,
                senderId: userId,
                senderName: userName,
                issueId,
                issueTitle: issue.title,
            });
        }

        // 2. Notify Parent Comment Owner if it's a reply
        if (parentId) {
            const parentComment = await this.repository.findById(parentId);
            if (parentComment && parentComment.userId.toString() !== userId.toString()) {
                domainEvents.emit(DOMAIN_EVENTS.COMMENT_REPLIED, {
                    recipientId: parentComment.userId,
                    senderId: userId,
                    senderName: userName,
                    issueId,
                    issueTitle: issue.title,
                });
            }
        }

        return comment;
    }

    /**
     * Get comments for an issue, grouped by parent.
     */
    async getIssueComments(issueId) {
        const [parents, replies] = await Promise.all([
            this.repository.getIssueComments(issueId, true),
            this.repository.getIssueComments(issueId, false),
        ]);

        const repliesByParent = replies.reduce((acc, reply) => {
            const parentKey = reply.parentId.toString();
            if (!acc[parentKey]) acc[parentKey] = [];
            acc[parentKey].push(reply);
            return acc;
        }, {});

        return parents.map((p) => ({
            ...p,
            replies: repliesByParent[p._id.toString()] || [],
        }));
    }

    /**
     * Update a comment.
     */
    async updateComment(userId, commentId, content) {
        const comment = await this.repository.findById(commentId);
        if (!comment) throw new NotFoundError("Comment");

        if (comment.userId.toString() !== userId.toString()) {
            throw new UnauthorizedError("Not authorized to edit this comment");
        }

        comment.content = content;
        comment.isEdited = true;
        comment.editedAt = new Date();
        await comment.save();

        return comment.populate("userId", "name avatar email");
    }

    /**
     * Delete a comment.
     */
    async deleteComment(userId, userRole, commentId) {
        const comment = await this.repository.findById(commentId);
        if (!comment) throw new NotFoundError("Comment");

        const isAdmin = userRole === "ADMIN";
        const isOwner = comment.userId.toString() === userId.toString();

        if (!isAdmin && !isOwner) {
            throw new UnauthorizedError("Not authorized to delete this comment");
        }

        return this.repository.deleteWithReplies(commentId);
    }
}

export default new CommentService(commentRepository);
