import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
    path: { type: String, required: true },
    content: { type: String, default: "" },
    language: { type: String, default: "plaintext" },
    size: { type: Number, default: 0 }
});

const CommitSchema = new mongoose.Schema({
    sha: { type: String, required: true },
    message: { type: String, required: true },
    author: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

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
    assignedDeveloper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    workspaceId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: { type: String, required: true },
    files: [FileSchema],
    fileCount: { type: Number, default: 0 },
    totalSize: { type: Number, default: 0 },

    // Lifecycle
    status: {
        type: String,
        enum: ['CREATING', 'ACTIVE', 'ARCHIVED', 'DELETED'],
        default: 'ACTIVE',
        index: true
    },

    // GitHub repo info
    githubRepo: {
        owner: String,
        repo: String,
        fullName: String,
        cloneUrl: String,
    },

    // Branch info
    branch: {
        name: String,
        baseBranch: { type: String, default: 'main' },
        createdAt: Date,
    },

    // Pull Request tracking
    pullRequest: {
        number: Number,
        url: String,
        state: { type: String, enum: ['open', 'closed', 'merged'], default: 'open' },
        mergedAt: Date,
    },

    // Commit history
    commits: [CommitSchema],

    // Escrow / Payment
    paymentStatus: {
        type: String,
        enum: ['NONE', 'ESCROWED', 'RELEASED', 'FAILED', 'REFUNDED'],
        default: 'NONE',
    },
    escrowTxHash: String,
    releaseTxHash: String,

    createdAt: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date, index: true },
}, { timestamps: true });

// TTL index for auto-cleanup after expiration
WorkspaceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
WorkspaceSchema.index({ issue: 1, createdAt: -1 });
WorkspaceSchema.index({ assignedDeveloper: 1, status: 1 });

const Workspace = mongoose.model('Workspace', WorkspaceSchema);
export default Workspace;
