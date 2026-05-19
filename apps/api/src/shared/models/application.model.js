import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
	{
		issue: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Issue",
			required: true,
		},
		developer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		coverLetter: {
			type: String,
			required: true,
		},
        bidAmount: { // If they want to propose a different price
            type: Number
        },
		status: {
			type: String,
			enum: ["PENDING", "ACCEPTED", "REJECTED"],
			default: "PENDING",
		},
	},
	{
		timestamps: true,
	}
);

// Prevent double application
applicationSchema.index({ issue: 1, developer: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;