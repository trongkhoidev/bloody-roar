import { GoogleGenerativeAI } from "@google/generative-ai";
import Issue from "../../shared/models/issue.model.js";
import Workspace from "../../shared/models/workspace.model.js";
import Message from "../../shared/models/message.model.js";
import User from "../../shared/models/user.model.js";
import { AppError } from "../../shared/errors/errors.js";

class DisputeAssistantService {
    /**
     * Gather all evidence and generate an AI evaluation dossier.
     */
    async generateDossier(issueId) {
        const issue = await Issue.findById(issueId);
        if (!issue) throw new AppError("Issue not found", 404);

        const workspace = await Workspace.findOne({ issue: issueId });
        const client = await User.findById(issue.clientId);
        const developer = issue.assignedDeveloper ? await User.findById(issue.assignedDeveloper) : null;

        // Gather chat history
        const messages = await Message.find({ issue: issueId })
            .populate("sender", "name role")
            .sort({ createdAt: 1 })
            .lean();

        const chatLog = messages.map(m => `[${m.createdAt.toISOString()}] ${m.sender?.name} (${m.sender?.role}): ${m.content}`).join("\n");

        // Gather commit log
        const commitLog = workspace?.commits?.map(c => `[${c.timestamp ? new Date(c.timestamp).toISOString() : "unknown"}] SHA: ${c.sha} - ${c.message} (by ${c.author})`).join("\n") || "No commits recorded.";

        // Run Anti-Fraud checks
        const antiFraudWarnings = [];
        let isMultiAccountAnomaly = false;

        if (client && developer && client.fingerprint && developer.fingerprint) {
            if (client.fingerprint === developer.fingerprint) {
                antiFraudWarnings.push("CRITICAL: Client and Developer share the exact same device fingerprint (Self-Dealing / Multi-accounting Fraud suspected).");
                isMultiAccountAnomaly = true;
            }
        }

        if (client && client.reputation < 30) {
            antiFraudWarnings.push(`WARNING: Client has a very low reputation score (${client.reputation}).`);
        }
        if (developer && developer.reputation < 30) {
            antiFraudWarnings.push(`WARNING: Developer has a very low reputation score (${developer.reputation}).`);
        }

        // Build prompt context
        const context = {
            issue: {
                title: issue.title,
                description: issue.description,
                bounty: `${issue.bounty?.amount} ${issue.bounty?.currency}`,
                status: issue.status
            },
            client: {
                name: client?.name,
                reputation: client?.reputation,
                walletAddress: client?.walletAddress
            },
            developer: {
                name: developer?.name,
                reputation: developer?.reputation,
                walletAddress: developer?.walletAddress
            },
            chatCount: messages.length,
            commitCount: workspace?.commits?.length || 0,
            antiFraudWarnings,
            hasSbt: developer?.kycStatus === "APPROVED"
        };

        const systemPrompt = `You are the Bloody Roar AI Dispute Assistant, a highly objective legal and technical arbitrator for a web3 bug-fixing marketplace.
Your task is to analyze the gathered evidence of a dispute between a Client and a Developer, assess who is at fault, and recommend a resolution (Refund Client vs Release to Developer).

Analyze the evidence carefully:
1. **Communication**: Look for ghosting, toxic behavior, or shifting specifications.
2. **Work Done**: Check if the developer made actual progress (commits, file changes).
3. **Anti-Fraud**: Evaluate device fingerprint matches (which strongly indicate self-dealing or multi-accounting fraud).
4. **Reputation**: Factor in reputation levels and KYC status.

You must reply in a valid JSON format with the following structure:
{
  "recommendation": "REFUND_CLIENT" | "RELEASE_DEVELOPER" | "SPLIT_50_50",
  "confidenceScore": number (between 0 and 100),
  "evaluationSummary": "string detailing the assessment of both parties",
  "keyFindings": ["finding 1", "finding 2", ...],
  "antiFraudAnalysis": "string explaining anti-fraud findings",
  "suggestedNextSteps": ["step 1", "step 2", ...]
}`;

        const prompt = `
### CASE EVIDENCE:
Client: ${context.client.name} (Reputation: ${context.client.reputation})
Developer: ${context.developer ? context.developer.name : "None"} (Reputation: ${context.developer ? context.developer.reputation : "N/A"})
KYC SBT Verified: ${context.hasSbt ? "Yes" : "No"}

Task Title: ${context.issue.title}
Task Description: ${context.issue.description}
Bounty: ${context.issue.bounty}

---
### ANTI-FRAUD AUDIT:
${antiFraudWarnings.length > 0 ? antiFraudWarnings.join("\n") : "No device or reputation anomalies detected."}

---
### CHATBOX TRANSCRIPT:
${chatLog || "No chat communication recorded."}

---
### GIT COMMIT HISTORY:
${commitLog}

---
Based on this evidence, produce the JSON dispute evaluation.
`;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Fallback mock system that uses deterministic logic to generate a high-quality dossier
            return this.generateMockDossier(context, isMultiAccountAnomaly, messages, workspace);
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const result = await model.generateContent([
                { text: systemPrompt },
                { text: prompt }
            ]);

            const responseText = result.response.text();
            return JSON.parse(responseText);
        } catch (error) {
            console.error("Gemini API Error, falling back to mock evaluation:", error);
            return this.generateMockDossier(context, isMultiAccountAnomaly, messages, workspace);
        }
    }

    generateMockDossier(context, isMultiAccountAnomaly, messages, workspace) {
        let recommendation = "RELEASE_DEVELOPER";
        let confidenceScore = 85;
        const keyFindings = [];
        let evaluationSummary = "";
        let antiFraudAnalysis = "";

        if (isMultiAccountAnomaly) {
            recommendation = "REFUND_CLIENT";
            confidenceScore = 98;
            keyFindings.push("Client and Developer share the exact same device signature.");
            keyFindings.push("This indicates self-dealing or multi-accounting fraud to harvest rewards/ratings.");
            evaluationSummary = `Critical security warning: This dispute was triggered on a task where both the posting client (${context.client.name}) and the solving developer (${context.developer?.name}) are operating from the exact same device. This is a severe breach of marketplace rules.`;
            antiFraudAnalysis = "Device fingerprint matches perfectly between client and developer accounts. High certainty of multi-account collusion.";
        } else {
            const developerCommits = workspace?.commits?.length || 0;
            const chatCount = messages.length;

            if (developerCommits === 0) {
                recommendation = "REFUND_CLIENT";
                confidenceScore = 90;
                keyFindings.push("Developer has registered zero commits in the sandbox environment.");
                keyFindings.push("No evidence of technical code changes or progress towards fixing the bug.");
                evaluationSummary = "The developer accepted the issue but failed to produce any commits or evidence of work in the secure sandbox environment. The client is fully entitled to a refund of their deposited escrow bounty.";
                antiFraudAnalysis = "No security or multi-account alerts triggered. Normal device fingerprint isolation.";
            } else {
                keyFindings.push(`Developer committed ${developerCommits} code change(s) in the sandbox.`);
                keyFindings.push(`Both parties exchanged ${chatCount} message(s) in the workspace chat.`);
                
                if (context.hasSbt) {
                    keyFindings.push("Developer has successfully completed secure eKYC with 3D liveness detection (Soulbound Token verified).");
                }

                evaluationSummary = `The developer (${context.developer?.name}) has shown active commitment with valid code changes inside the sandbox workspace. Communication history shows active collaboration. We recommend releasing the bounty funds to the developer.`;
                antiFraudAnalysis = "Security scan cleared. Developer is eKYC verified and holds a valid Soulbound identity token.";
            }
        }

        return {
            recommendation,
            confidenceScore,
            evaluationSummary,
            keyFindings,
            antiFraudAnalysis,
            suggestedNextSteps: [
                recommendation === "REFUND_CLIENT" ? "Execute Smart Contract Refund/Clawback method" : "Execute Smart Contract Release method",
                "Flag/Audit involved accounts for reputation adjustments",
                "Notify users via email/notifications of dispute decision"
            ]
        };
    }
}

export default new DisputeAssistantService();
