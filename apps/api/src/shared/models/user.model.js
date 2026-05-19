import mongoose from "mongoose";
import { UserRole } from "@bloody-roar/shared-types";

const userSchema = new mongoose.Schema(
	{
        // Identity
		walletAddress: {
			type: String,
			unique: true,
            sparse: true,
            lowercase: true,
		},
		email: {
			type: String,
			unique: true,
            sparse: true,
            lowercase: true,
            trim: true
		},
        password: {
            type: String,
            select: false
        },

        // Profile
		name: {
			type: String,
            default: "Anonymous User"
		},
		avatar: {
			type: String,
            default: ""
		},
		role: {
			type: String,
			enum: Object.values(UserRole),
			default: UserRole.DEVELOPER,
		},

        bio: { type: String, default: "" },
        location: { type: String, default: "" },
        portfolioUrl: { type: String, default: "" },

        // Stats
        reputation: { type: Number, default: 0 },
        totalEarnings: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        jobsApplied: { type: Number, default: 0 },
        jobsCompleted: { type: Number, default: 0 },
        jobsPosted: { type: Number, default: 0 },

        skills: [{ type: String }],
        githubUrl: String,
        linkedin: String,

        // GitHub OAuth
        github: {
            id: String,
            username: String,
            accessToken: String,
            avatarUrl: String,
            connectedAt: Date,
        },

        // Anti-Fraud
        fingerprint: {
            type: String,
            default: ""
        },

        // KYC & Soulbound Token Identity
        kycStatus: {
            type: String,
            enum: ["NONE", "PENDING", "APPROVED"],
            default: "NONE"
        },
        sbtTokenId: {
            type: Number
        },
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
