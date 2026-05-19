import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		issue: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Issue",
			required: true,
		},
		// Composite room key: "issueId_devId" — isolates chat per issue per developer
		chatRoomId: {
			type: String,
			required: true,
			index: true,
		},
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		content: {
			type: String,
			default: "",
		},
		type: {
			type: String,
			enum: ["TEXT", "FILE", "CODE"],
			default: "TEXT",
		},
        attachments: { type: [String], default: [] },
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
        isFlagged: { type: Boolean, default: false },
        flagReason: { type: String }
	},
	{ timestamps: true }
);

// Performance indexes
messageSchema.index({ chatRoomId: 1, createdAt: 1 });
messageSchema.index({ issue: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
