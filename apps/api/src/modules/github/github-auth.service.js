import { Octokit } from "@octokit/rest";
import User from "../../shared/models/user.model.js";
import Audit from "../../shared/models/audit.model.js";
import { AppError } from "../../shared/errors/errors.js";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

/**
 * GitHubAuthService — handles OAuth flow and connection status.
 */
export class GitHubAuthService {
    /**
     * Get OAuth Authorization URL
     */
    getAuthUrl(protocol, host, userId) {
        const redirectUri = `${protocol}://${host}/api/github/callback`;
        const scope = "repo user:email";
        return `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(
            redirectUri
        )}&scope=${encodeURIComponent(scope)}&state=${userId || ""}`;
    }

    /**
     * Handle Step 2: Exchange code for token and link user.
     */
    async handleCallback(code, userId) {
        if (!code) throw new AppError("No code provided from GitHub", 400);

        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = await tokenRes.json();
        if (tokenData.error) throw new AppError(tokenData.error, 400);

        const accessToken = tokenData.access_token;
        const octokit = new Octokit({ auth: accessToken });
        const { data: ghUser } = await octokit.users.getAuthenticated();

        await User.findByIdAndUpdate(userId, {
            github: {
                id: ghUser.id.toString(),
                username: ghUser.login,
                accessToken,
                avatarUrl: ghUser.avatar_url,
                connectedAt: new Date(),
            },
        });

        await Audit.create({
            action: "GITHUB_CONNECT",
            actor: userId,
            metadata: { githubUsername: ghUser.login },
        });

        return ghUser;
    }

    /**
     * Disconnect GitHub from user profile.
     */
    async disconnect(userId) {
        await User.findByIdAndUpdate(userId, { $unset: { github: "" } });
        await Audit.create({ action: "GITHUB_DISCONNECT", actor: userId });
        return true;
    }
}

export default new GitHubAuthService();
