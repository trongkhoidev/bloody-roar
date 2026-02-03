import Issue from "../models/issue.model.js";
import Application from "../models/application.model.js";
import User from "../models/user.model.js";

// @desc    Create a new Issue
// @route   POST /api/issues
// @access  Private (Client only)
export const createIssue = async (req, res) => {
	try {
        // Enforce role check if needed, or just let any Auth user create? Plan says Client.
        if (req.user.role !== 'CLIENT') {
            return res.status(403).json({ message: "Only Clients can post issues" });
        }

		const { title, description, category, budget, tags, githubRepoUrl, attachments } = req.body;

        if (!title || !description || !budget) {
             return res.status(400).json({ message: "Please fill in all required fields" });
        }

        if (Number(budget) <= 0) {
            return res.status(400).json({ message: "Budget must be greater than 0" });
        }

		const issue = await Issue.create({
			clientId: req.user._id,
			title,
			description,
			category,
			bounty: {
                amount: budget,
                currency: 'ETH' // Defaulting to ETH as per updated plan
            },
            tags: Array.isArray(tags) ? tags : [], 
            attachments: Array.isArray(attachments) ? attachments : [],
			githubRepoUrl,
		});

		res.status(201).json({ success: true, data: issue });
	} catch (error) {
		res.status(500).json({ message: "Server Error", error: error.message });
	}
};

// @desc    Get all issues with filters
// @route   GET /api/issues
// @access  Public
export const getIssues = async (req, res) => {
	try {
        const { category, status, minBudget, maxBudget } = req.query;

        let query = {};

        if (category) query.category = category;
        if (status) query.status = status;
        
        // Budget filter logic assumes bounty.amount
        if (minBudget || maxBudget) {
            query['bounty.amount'] = {};
            if (minBudget) query['bounty.amount'].$gte = Number(minBudget);
            if (maxBudget) query['bounty.amount'].$lte = Number(maxBudget);
        }

		const issues = await Issue.find(query)
            .populate("clientId", "name avatar reputation")
            .sort({ createdAt: -1 });

		res.status(200).json({ success: true, count: issues.length, data: issues });
	} catch (error) {
		res.status(500).json({ message: "Server Error", error: error.message });
	}
};

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Public
export const getIssueById = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id).populate("clientId", "name avatar reputation");
        if (!issue) return res.status(404).json({ message: "Issue not found" });
        res.status(200).json({ success: true, data: issue });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

// @desc    Apply for an issue
// @route   POST /api/issues/:id/apply
// @access  Private (Developer only)
export const applyForIssue = async (req, res) => {
    try {
        if (req.user.role !== 'DEVELOPER') {
            return res.status(403).json({ message: "Only Developers can apply" });
        }

        const issueId = req.params.id;
        const { coverLetter, bidAmount } = req.body;

        const issue = await Issue.findById(issueId);
        if (!issue) return res.status(404).json({ message: "Issue not found" });

        // Check availability
        if (issue.status !== 'OPEN') {
            return res.status(400).json({ message: "Issue is not open for applications" });
        }

        // Check if already applied
        const existingApp = await Application.findOne({ issue: issueId, developer: req.user._id });
        if (existingApp) {
            return res.status(400).json({ message: "You have already applied to this issue" });
        }

        const application = await Application.create({
            issue: issueId,
            developer: req.user._id,
            coverLetter,
            bidAmount: bidAmount || issue.bounty.amount
        });

        res.status(201).json({ success: true, data: application });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}
// @desc    Approve an Application
// @route   POST /api/issues/:id/approve/:appId
// @access  Private (Client only)
export const approveApplication = async (req, res) => {
    try {
        if (req.user.role !== 'CLIENT') {
            return res.status(403).json({ message: "Only Clients can approve applications" });
        }

        const { id, appId } = req.params;
        const { txHash } = req.body; // Expecting transaction hash from frontend

        const issue = await Issue.findById(id);
        if (!issue) return res.status(404).json({ message: "Issue not found" });

        if (issue.clientId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to manage this issue" });
        }

        const application = await Application.findById(appId);
        if (!application) return res.status(404).json({ message: "Application not found" });
        
        // Verify txHash? (In prod, we should query the provider to check if txHash is valid and related to this issue)
        // For now, we trust the client passed a valid hash or just store it.
        // if (!txHash) return res.status(400).json({ message: "Transaction Hash is required" });

        // Update Application Status
        application.status = 'ACCEPTED';
        await application.save();

        // Update Issue Status & Assign Dev
        issue.status = 'ONGOING';
        issue.assignedDeveloper = application.developer;
        // Optionally store the escrow tx hash
        issue.escrowTxHash = txHash; 
        await issue.save();

        // Reject other pending applications (Optional but good UX)
        // await Application.updateMany(
        //     { issue: id, _id: { $ne: appId }, status: 'PENDING' },
        //     { status: 'REJECTED' }
        // );

        res.status(200).json({ success: true, message: "Application approved", data: issue });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get Issues posted by logged-in Client
// @route   GET /api/issues/client/my-issues
// @access  Private (Client)
export const getMyIssues = async (req, res) => {
    try {
        const issues = await Issue.find({ clientId: req.user._id }).sort({ createdAt: -1 });
        
        // Enhance with application count (could be optimized with aggregate)
        const issuesWithApps = await Promise.all(issues.map(async (issue) => {
            const appCount = await Application.countDocuments({ issue: issue._id });
            return {
                ...issue.toObject(),
                applicationCount: appCount
            };
        }));

        res.status(200).json({ success: true, data: issuesWithApps });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

// @desc    Get Applications by logged-in Developer
// @route   GET /api/issues/developer/my-applications
// @access  Private (Developer)
export const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ developer: req.user._id })
            .populate({
                path: "issue",
                populate: { path: "clientId", select: "name avatar" }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

// @desc    Get Applications for a specific Issue (For Client Dashboard)
// @route   GET /api/issues/:id/applications
// @access  Private (Client)
export const getIssueApplications = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: "Issue not found"});

        if (issue.clientId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        const applications = await Application.find({ issue: req.params.id })
            .populate("developer", "name avatar reputation skills githubUrl")
            .sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

// @desc    Delete an issue (Admin or Owner)
// @route   DELETE /api/issues/:id
// @access  Private
export const deleteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        // Check if user is admin (hardcoded) or post owner
        const isAdmin = req.user.email === 'admin@gmail.com' || req.user.name === 'admin';
        const isOwner = issue.clientId.toString() === req.user._id.toString();
        
        if (!isAdmin && !isOwner) {
            return res.status(401).json({ message: "Not authorized to delete this issue" });
        }

        await Issue.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ success: true, message: "Issue deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Update issue status (Admin or Owner)
// @route   PATCH /api/issues/:id/status
// @access  Private
export const updateIssueStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const validStatuses = ['OPEN', 'PENDING_CONFIRM', 'ONGOING', 'COMPLETED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const issue = await Issue.findById(req.params.id);
        
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        // Check if user is admin (hardcoded) or post owner
        const isAdmin = req.user.email === 'admin@gmail.com' || req.user.name === 'admin';
        const isOwner = issue.clientId.toString() === req.user._id.toString();
        
        if (!isAdmin && !isOwner) {
            return res.status(401).json({ message: "Not authorized to update this issue" });
        }

        issue.status = status;
        await issue.save();
        
        res.status(200).json({ success: true, data: issue });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
