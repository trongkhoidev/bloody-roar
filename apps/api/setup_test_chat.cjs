const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }, { strict: false }));
        const Issue = mongoose.model('Issue', new mongoose.Schema({ title: String, clientId: mongoose.Schema.Types.ObjectId }, { strict: false }));
        const Workspace = mongoose.model('Workspace', new mongoose.Schema({ workspaceId: String, issue: mongoose.Schema.Types.ObjectId }, { strict: false }));
        const Chat = mongoose.model('Chat', new mongoose.Schema({ issue: mongoose.Schema.Types.ObjectId, participants: Array }, { strict: false }));
        const Application = mongoose.model('Application', new mongoose.Schema({ issue: mongoose.Schema.Types.ObjectId, developer: mongoose.Schema.Types.ObjectId, status: String }, { strict: false }));

        const testUser = await User.findOne({ email: 'test@test.com' });
        const adminUser = await User.findOne({ email: 'admin@bloodyroar.io' });
        const issue = await Issue.findOne({});
        const workspace = await Workspace.findOne({ workspaceId: 'test-workspace-123' });

        if (!issue.clientId) {
            issue.clientId = adminUser._id;
            await issue.save();
        }

        // Ensure an application exists
        let app = await Application.findOne({ issue: issue._id, developer: testUser._id });
        if (!app) {
            app = await Application.create({
                issue: issue._id,
                developer: testUser._id,
                status: 'ACCEPTED',
                bid: 100
            });
            console.log('Created application for test user');
        } else {
            app.status = 'ACCEPTED';
            await app.save();
            console.log('Updated application status to ACCEPTED');
        }

        // Ensure a chat exists for this issue
        let chat = await Chat.findOne({ issue: issue._id });
        if (!chat) {
            chat = await Chat.create({
                issue: issue._id,
                participants: [testUser._id, adminUser._id],
                messages: []
            });
            console.log('Created chat for issue');
        } else {
            console.log('Chat already exists for issue');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
