import Issue from "../models/issue.model.js";

// @desc    Handle GitHub Webhook
// @route   POST /api/webhooks/github
// @access  Public (Signature verification recommended in prod)
export const handleGithubWebhook = async (req, res) => {
    try {
        const event = req.headers["x-github-event"];
        const payload = req.body;

        if (event === "pull_request") {
            const { action, pull_request } = payload;
            
            // Logic to find Issue ID from PR Title or Body
            // Expecting format: "[BloodyRoar-ID] Title" or just including ID?
            // Let's assume PR Body contains "Fixes: <IssueID>" or we match via Repo URL + Branch/Context?
            // SIMPLIFICATION:
            // For hackathon/demo, we can't easily expect the User to put the exact MongoID in the PR title.
            // Alternative: The Developer dashboard "Submit PR" button could call our API to link it manually,
            // OR we rely on a specific tag.
            // Let's look for a regex match in the PR Body: "IssueID: <mongo_id>"
            
            const issueIdMatch = pull_request.body?.match(/IssueID:\s*([a-fA-F0-9]{24})/);
            
            if (issueIdMatch) {
                const issueId = issueIdMatch[1];
                const issue = await Issue.findById(issueId);

                if (issue) {
                    // Update Issue with PR Link
                    if (action === "opened") {
                        issue.prLink = pull_request.html_url;
                        await issue.save();
                        console.log(`Issue ${issueId} linked to PR: ${pull_request.html_url}`);
                    }

                    // Handle Merged
                    if (action === "closed" && pull_request.merged) {
                        issue.isPrMerged = true;
                        // issue.status = "COMPLETED_PENDING_PAYMENT"; // Optional new status
                        await issue.save();
                        console.log(`Issue ${issueId} PR Merged! Ready for payment.`);
                    }
                }
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
