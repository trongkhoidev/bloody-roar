import commentService from "./comment.service.js";
import { asyncHandler } from "../../shared/middleware/errorHandler.middleware.js";
import { ApiResponse } from "../../shared/response/ApiResponse.js";

/**
 * CommentController — handles HTTP mapping for the comments module.
 */
export const createComment = asyncHandler(async (req, res) => {
    const comment = await commentService.createComment(
        req.user._id,
        req.user.name,
        req.params.id,
        req.body
    );
    res.status(201).json(ApiResponse.created(comment, "Comment posted"));
});

export const getComments = asyncHandler(async (req, res) => {
    const comments = await commentService.getIssueComments(req.params.id);
    res.status(200).json(ApiResponse.ok(comments, "Comments fetched"));
});

export const updateComment = asyncHandler(async (req, res) => {
    const comment = await commentService.updateComment(
        req.user._id,
        req.params.id,
        req.body.content
    );
    res.status(200).json(ApiResponse.ok(comment, "Comment updated"));
});

export const deleteComment = asyncHandler(async (req, res) => {
    await commentService.deleteComment(
        req.user._id,
        req.user.role,
        req.params.id
    );
    res.status(200).json(ApiResponse.ok(null, "Comment deleted"));
});
