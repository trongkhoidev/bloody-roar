import Message from "../models/message.model.js";
import Application from "../models/application.model.js";
import Issue from "../models/issue.model.js";

// @desc    Get Chat History for an Issue
// @route   GET /api/chat/:issueId
// @access  Private
// (Already implemented inline in routes, but moving here is cleaner. Keeping inline for now to avoid breaking changes, implementing NEW controller methods here)

// @desc    Get Helper Contacts (Devs working with Client)
// @route   GET /api/chat/contacts
// @access  Private (Client)
export const getContacts = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role; // Assuming role is available in req.user

        let contacts = [];

        if (userRole === 'CLIENT') {
            // ... (Existing Logic for Client)
            const myIssues = await Issue.find({ clientId: userId }).select('_id title status');
            const myIssueIds = myIssues.map(i => i._id);

            const apps = await Application.find({
                issue: { $in: myIssueIds },
                status: { $in: ['ACCEPTED', 'COMPLETED', 'PENDING'] }
            }).populate('developer', 'name email avatar _id');

            const contactsMap = new Map();
            apps.forEach(app => {
                if (app.developer) {
                    const devId = app.developer._id.toString();
                    if (!contactsMap.has(devId)) {
                        const isWorking = app.status === 'ACCEPTED';
                        contactsMap.set(devId, {
                            _id: app.developer._id,
                            name: app.developer.name,
                            avatar: app.developer.avatar,
                            status: isWorking ? 'working' : 'contact',
                            issueTitle: myIssues.find(i => i._id.toString() === app.issue.toString())?.title,
                            issueId: app.issue,
                            role: 'DEVELOPER'
                        });
                    } else if (app.status === 'ACCEPTED') {
                        contactsMap.get(devId).status = 'working';
                        contactsMap.get(devId).issueTitle = myIssues.find(i => i._id.toString() === app.issue.toString())?.title;
                         contactsMap.get(devId).issueId = app.issue;
                    }
                }
            });
            contacts = Array.from(contactsMap.values());

        } else {
            // DEVELOPER LOGIC
            // 1. Find applications where developer is ME
            const myApps = await Application.find({ 
                developer: userId,
                status: { $in: ['ACCEPTED', 'COMPLETED'] } // Only show clients heavily involved? Or PENDING too?
            }).populate({
                path: 'issue',
                select: 'title clientId', // We need clientId to get Client info
                populate: { path: 'clientId', select: 'name email avatar' } // Only populated if issue schema references user
            });

            // Note: Issue schema likely just stores clientId as ObjectId, need to populate it from User model
            // But 'issue' field in Application is ObjectId ref to Issue. Issue has clientId ref to User.
            // Let's refine the query.

            const apps = await Application.find({ developer: userId }).populate('issue');
            
            const contactsMap = new Map();

            for (const app of apps) {
                if (!app.issue) continue;
                
                // We need to fetch Client details efficiently. 
                // Since `populate` is nested, let's do a simple lookup or rely on populate if set up.
                // Assuming Issue model has `clientId` ref to User.
                const issue = await Issue.findById(app.issue._id).populate('clientId', 'name avatar');
                
                if (issue && issue.clientId) {
                    const client = issue.clientId;
                    const clientId = client._id.toString();

                     if (!contactsMap.has(clientId)) {
                        const isWorking = app.status === 'ACCEPTED';
                        contactsMap.set(clientId, {
                            _id: client._id,
                            name: client.name,
                            avatar: client.avatar,
                            status: isWorking ? 'working' : 'contact',
                            issueTitle: issue.title,
                            issueId: issue._id,
                            role: 'CLIENT'
                        });
                    } else if (app.status === 'ACCEPTED') {
                         contactsMap.get(clientId).status = 'working';
                         contactsMap.get(clientId).issueTitle = issue.title;
                         contactsMap.get(clientId).issueId = issue._id;
                    }
                }
            }
             contacts = Array.from(contactsMap.values());
        }

        res.status(200).json({ success: true, data: contacts });

    } catch (error) {
        console.error("Get Contacts Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
