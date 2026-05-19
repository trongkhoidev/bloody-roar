import Message from "../../shared/models/message.model.js";

/**
 * ChatRepository — handles DB operations for the chat module.
 */
export class ChatRepository {
    async findMessages(query) {
        return Message.find(query)
            .populate("sender", "name avatar")
            .sort({ createdAt: 1 })
            .lean();
    }

    async createMessage(data) {
        return Message.create(data);
    }

    async findMessageById(id) {
        return Message.findById(id).populate("sender", "name avatar");
    }

    async deleteMessage(id) {
        return Message.findByIdAndDelete(id);
    }
}

export default new ChatRepository();
