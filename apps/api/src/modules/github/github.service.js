import { Octokit } from "@octokit/rest";
import User from "../../shared/models/user.model.js";
import { UnauthorizedError } from "../../shared/errors/errors.js";

/**
 * GitHubService — handles all authenticated and unauthenticated interactions with GitHub API.
 */
export class GitHubService {
    /**
     * Get an Octokit instance for a user, using their access token if available.
     * @param {string} userId
     */
    async getOctokit(userId) {
        try {
            const user = await User.findById(userId);
            if (user?.github?.accessToken) {
                return new Octokit({ auth: user.github.accessToken });
            }
        } catch {
            /* ignore */
        }
        return new Octokit(); // Unauthenticated fallback
    }

    /**
     * Get an Octokit instance for an authenticated user. Throws if not connected.
     * @param {string} userId
     */
    async getUserOctokit(userId) {
        const user = await User.findById(userId);
        if (!user?.github?.accessToken) {
            throw new UnauthorizedError("GitHub not connected. Please connect your account first.");
        }
        return new Octokit({ auth: user.github.accessToken });
    }

    /**
     * Parse owner/repo from a GitHub URL.
     * @param {string} url
     */
    parseRepoUrl(url) {
        try {
            const match = url.match(/github\.com\/([\w-]+)\/([\w.-]+?)(\.git)?\/?$/);
            if (!match) throw new Error("Invalid GitHub URL");
            return { owner: match[1], repo: match[2] };
        } catch {
            throw new Error("Invalid GitHub repository URL format");
        }
    }

    /**
     * Create a branch on a repository.
     */
    async createBranch(userId, owner, repo, baseBranch, branchName) {
        const octokit = await this.getUserOctokit(userId);

        const { data: refData } = await octokit.git.getRef({
            owner,
            repo,
            ref: `heads/${baseBranch}`,
        });
        const baseSha = refData.object.sha;

        await octokit.git.createRef({
            owner,
            repo,
            ref: `refs/heads/${branchName}`,
            sha: baseSha,
        });

        return { branchName, baseBranch, repo: `${owner}/${repo}` };
    }

    /**
     * Commit multiple files to a branch.
     */
    async commitFiles(userId, owner, repo, branch, files, message) {
        const octokit = await this.getUserOctokit(userId);

        // Get latest commit
        const { data: refData } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
        const latestCommitSha = refData.object.sha;

        const { data: commitData } = await octokit.git.getCommit({ owner, repo, commit_sha: latestCommitSha });
        const baseTreeSha = commitData.tree.sha;

        // Create blobs
        const treeItems = await Promise.all(
            files.map(async (file) => {
                const { data: blob } = await octokit.git.createBlob({
                    owner,
                    repo,
                    content: Buffer.from(file.content).toString("base64"),
                    encoding: "base64",
                });
                return {
                    path: file.path,
                    mode: "100644",
                    type: "blob",
                    sha: blob.sha,
                };
            })
        );

        // Create tree
        const { data: newTree } = await octokit.git.createTree({
            owner,
            repo,
            base_tree: baseTreeSha,
            tree: treeItems,
        });

        // Create commit
        const user = await User.findById(userId);
        const { data: newCommit } = await octokit.git.createCommit({
            owner,
            repo,
            message: message || "Update from Bloody Roar workspace",
            tree: newTree.sha,
            parents: [latestCommitSha],
            author: {
                name: user.name || user.github?.username || "Developer",
                email: user.email || `${user.github?.username}@users.noreply.github.com`,
                date: new Date().toISOString(),
            },
        });

        // Update branch ref
        await octokit.git.updateRef({
            owner,
            repo,
            ref: `heads/${branch}`,
            sha: newCommit.sha,
        });

        return newCommit;
    }
}

export default new GitHubService();
