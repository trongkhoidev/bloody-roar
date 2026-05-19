import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    issueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    attachments: [{
        type: String
    }],
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
commentSchema.index({ issueId: 1, createdAt: -1 });
commentSchema.index({ parentId: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
