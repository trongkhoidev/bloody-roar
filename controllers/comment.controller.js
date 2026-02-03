import Comment from '../models/comment.model.js';
import Issue from '../models/issue.model.js';

// @desc    Create a new comment
// @route   POST /api/issues/:id/comments
// @access  Private
export const createComment = async (req, res) => {
    try {
        const { content, attachments, parentId } = req.body;
        const issueId = req.params.id;

        // Verify issue exists
        const issue = await Issue.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const comment = await Comment.create({
            issueId,
            userId: req.user._id,
            content,
            attachments: attachments || [],
            parentId: parentId || null
        });

        // Populate user info
        await comment.populate('userId', 'name avatar email');

        res.status(201).json({ success: true, data: comment });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get comments for an issue
// @route   GET /api/issues/:id/comments
// @access  Public
export const getComments = async (req, res) => {
    try {
        const issueId = req.params.id;

        const comments = await Comment.find({ issueId, parentId: null })
            .populate('userId', 'name avatar email')
            .sort({ createdAt: -1 });

        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.find({ parentId: comment._id })
                    .populate('userId', 'name avatar email')
                    .sort({ createdAt: 1 });
                
                return {
                    ...comment.toObject(),
                    replies
                };
            })
        );

        res.status(200).json({ success: true, data: commentsWithReplies });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a comment
// @route   PATCH /api/comments/:id
// @access  Private (Owner only)
export const updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check ownership
        if (comment.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        comment.content = content;
        comment.isEdited = true;
        comment.editedAt = new Date();
        await comment.save();

        await comment.populate('userId', 'name avatar email');

        res.status(200).json({ success: true, data: comment });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Owner or Admin)
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check ownership or admin
        const isAdmin = req.user.email === 'admin@gmail.com' || req.user.name === 'admin';
        const isOwner = comment.userId.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Delete all replies first
        await Comment.deleteMany({ parentId: comment._id });
        
        // Delete the comment
        await Comment.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
