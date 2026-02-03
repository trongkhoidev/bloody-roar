import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		issue: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Issue",
			required: true,
		},
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		content: {
		type: String,
		default: "", // ✅ Allow empty content for image-only messages
	},
		type: {
			type: String,
			enum: ["TEXT", "FILE", "CODE"],
			default: "TEXT",
		},
        attachments: {
            type: [String],
            default: []
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        isFlagged: {
            type: Boolean,
            default: false
        },
        flagReason: {
            type: String
        }
	},
	{
		timestamps: true,
	}
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
