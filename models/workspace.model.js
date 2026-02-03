import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    language: {
        type: String,
        default: "plaintext"
    },
    size: {
        type: Number,
        default: 0
    }
});

const WorkspaceSchema = new mongoose.Schema({
    issue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        required: true,
        index: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workspaceId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    files: [FileSchema],
    fileCount: {
        type: Number,
        default: 0
    },
    totalSize: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    }
});

// TTL index for auto-cleanup after expiration
WorkspaceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for querying
WorkspaceSchema.index({ issue: 1, createdAt: -1 });

const Workspace = mongoose.model('Workspace', WorkspaceSchema);

export default Workspace;
