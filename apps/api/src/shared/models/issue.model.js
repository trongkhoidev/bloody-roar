import mongoose, { Schema } from 'mongoose';
import { IssueStatus, IssueCategory } from '@bloody-roar/shared-types';
import Comment from './comment.model.js';

const issueSchema = new mongoose.Schema({
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: Object.values(IssueCategory),
        required: true
    },
    bounty: {
        amount: { type: Number, required: true },
        currency: { type: String, default: 'ETH' },
        isEscrowed: { type: Boolean, default: false }
    },
    escrowTxHash: { type: String },
    attachments: [{ type: String }],
    tags: [{ type: String }],
    prLink: { type: String },
    isPrMerged: { type: Boolean, default: false },
    githubRepoUrl: { type: String, required: true },
    status: {
        type: String,
        enum: Object.values(IssueStatus),
        default: IssueStatus.OPEN
    },
    workspace: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace'
    },
    assignedDeveloper: { type: Schema.Types.ObjectId, ref: 'User' },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate comments
issueSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'issueId'
});

// Performance indexes (must be before model creation)
issueSchema.index({ status: 1, category: 1 });
issueSchema.index({ tags: 1 });
issueSchema.index({ clientId: 1 });
issueSchema.index({ assignedDeveloper: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ title: 'text', description: 'text' });

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
