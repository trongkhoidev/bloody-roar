import mongoose, { Schema } from 'mongoose';

const issueSchema = new mongoose.Schema({

    clientId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    }, 

    category: { 
        type: String, 
        enum: ['Web', 'Mobile', 'Blockchain', 'AI', 'Game', 'Other'],
        required: true 
    },

    bounty: {
        amount: { type: Number, required: true },
        currency: { type: String, default: 'ETH' }, // ETH, USDC or Fiat
        isEscrowed: { type: Boolean, default: false } // Đã nạp tiền vào Smart Contract chưa
    },

    // For Phase 4
    escrowTxHash: { type: String },
    
    // Attachments (Images/Files)
    attachments: [{ type: String }],
    
    // For Phase 5
    prLink: { type: String },
    isPrMerged: { type: Boolean, default: false },

    githubRepoUrl: { 
        type: String 
    },
    
    status: { 
        type: String, 
        enum: ['OPEN', 'PENDING_CONFIRM', 'ONGOING', 'COMPLETED'],
        default: 'OPEN' 
    },

    assignedDeveloper: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
}, { 
    timestamps: true // Tự động tạo createdAt và updatedAt
})

const Issue  = mongoose.model('Issue', issueSchema);
export default Issue;