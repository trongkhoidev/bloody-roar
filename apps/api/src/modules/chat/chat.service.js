import chatRepository from "./chat.repository.js";
import issueRepository from "../issues/issue.repository.js";
import applicationRepository from "../issues/application.repository.js";

/**
 * ChatService — handles chat history and contact management.
 */
export class ChatService {
    async getChatHistory(issueId, devId) {
        const query = devId
            ? { chatRoomId: `${issueId}_${devId}` }
            : { issue: issueId };

        return chatRepository.findMessages(query);
    }

    /**
     * Build the contacts list with per-issue isolation.
     * Logic refactored for clarity and performance.
     */
    async getContacts(user) {
        const userId = user._id;
        const contactsMap = new Map();

        // 1. Fetch Client-side contacts (issues posted by this user and their applicants)
        const myIssues = await issueRepository.find({ clientId: userId }, {}, 0, 100);
        if (myIssues && myIssues.length > 0) {
            const myIssueIds = myIssues.map((i) => i._id);
            const apps = await applicationRepository.findByIssue({ $in: myIssueIds });
            const issueMap = new Map(myIssues.map((i) => [i._id.toString(), i]));

            apps.forEach((app) => {
                if (!app.developer) return;
                const devId = app.developer._id.toString();
                const issueId = app.issue.toString();
                const compositeKey = `${devId}_${issueId}`;
                const issue = issueMap.get(issueId);
                const isWorking = app.status === "ACCEPTED";

                if (!contactsMap.has(compositeKey) || isWorking) {
                    contactsMap.set(compositeKey, {
                        _id: app.developer._id,
                        name: app.developer.name,
                        avatar: app.developer.avatar,
                        status: isWorking ? "working" : "contact",
                        issueTitle: issue?.title,
                        issueId: app.issue,
                        devId: devId,
                        role: "DEVELOPER",
                        compositeKey,
                    });
                }
            });
        }

        // 2. Fetch Developer-side contacts (issues this user applied to and their poster clients)
        const myApps = await applicationRepository.findByDeveloper(userId);
        if (myApps && myApps.length > 0) {
            myApps.forEach((app) => {
                if (!app.issue || !app.issue.clientId) return;
                const issue = app.issue;
                const client = issue.clientId;
                const issueId = issue._id.toString();
                const devId = userId.toString();
                const compositeKey = `${devId}_${issueId}`;
                const isWorking = app.status === "ACCEPTED";

                if (!contactsMap.has(compositeKey) || isWorking) {
                    contactsMap.set(compositeKey, {
                        _id: client._id,
                        name: client.name,
                        avatar: client.avatar,
                        status: isWorking ? "working" : "contact",
                        issueTitle: issue.title,
                        issueId: issue._id,
                        devId: devId,
                        role: "CLIENT",
                        compositeKey,
                    });
                }
            });
        }

        return Array.from(contactsMap.values());
    }
}

export default new ChatService();
