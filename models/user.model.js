import mongoose from "mongoose";

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
            select: false // Only required for standard email/pass login
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
			enum: ["CLIENT", "DEVELOPER", "TUTOR"], // Standardized uppercase
			default: "DEVELOPER",
		},
        
        // Stats/Reputation
		reputation: {
			type: Number,
			default: 0,
		},
        skills: [{ type: String }],
        githubUrl: String,
        linkedin: String, // Fixed typo from 'linkedln'
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("User", userSchema);

export default User;