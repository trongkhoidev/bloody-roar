import mongoose from 'mongoose';

const AuditSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            'WORKSPACE_CREATE', 'WORKSPACE_ARCHIVE', 'WORKSPACE_DELETE',
            'FILE_EDIT', 'FILE_CREATE', 'FILE_DELETE',
            'COMMIT', 'PUSH',
            'BRANCH_CREATE',
            'PR_CREATE', 'PR_MERGE', 'PR_CLOSE',
            'ESCROW_DEPOSIT', 'ESCROW_RELEASE', 'ESCROW_REFUND', 'ESCROW_FAILED',
            'GITHUB_CONNECT', 'GITHUB_DISCONNECT',
            'APPLICATION_APPROVE', 'APPLICATION_REJECT',
            'ISSUE_STATUS_CHANGE',
        ],
        index: true,
    },
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    issue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        index: true,
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, { timestamps: true });

AuditSchema.index({ action: 1, createdAt: -1 });
AuditSchema.index({ issue: 1, createdAt: -1 });

export default mongoose.model('Audit', AuditSchema);
