import githubService from "./github.service.js";
import githubAuthService from "./github-auth.service.js";
import workspaceRepository from "../workspaces/workspace.repository.js";
import Issue from "../../shared/models/issue.model.js";
import Audit from "../../shared/models/audit.model.js";
import User from "../../shared/models/user.model.js";
import { asyncHandler } from "../../shared/middleware/errorHandler.middleware.js";
import { ApiResponse } from "../../shared/response/ApiResponse.js";
import { NotFoundError } from "../../shared/errors/errors.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

/**
 * GitHubController — mapping HTTP requests to modular GitHub services.
 */

// ── OAuth Handlers ──────────────────────────────────────────────────
export const githubOAuthRedirect = (req, res) => {
    const url = githubAuthService.getAuthUrl(req.protocol, req.get("host"), req.query.userId);
    res.redirect(url);
};

export const githubOAuthCallback = asyncHandler(async (req, res) => {
    const { code, state: userId } = req.query;
    try {
        const ghUser = await githubAuthService.handleCallback(code, userId);
        res.redirect(`${CLIENT_URL}/profile?github=connected&username=${ghUser.login}`);
    } catch (err) {
        res.redirect(`${CLIENT_URL}/profile?github=error&reason=${err.message}`);
    }
});

export const getGitHubStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user?.github?.accessToken) {
        return res.status(200).json(ApiResponse.ok({ connected: false }));
    }
    res.status(200).json(ApiResponse.ok({
        connected: true,
        username: user.github.username,
        avatarUrl: user.github.avatarUrl,
        connectedAt: user.github.connectedAt,
    }));
});

export const disconnectGitHub = asyncHandler(async (req, res) => {
    await githubAuthService.disconnect(req.user._id);
    res.status(200).json(ApiResponse.ok(null, "GitHub disconnected"));
});

// ── Git Ops Handlers ───────────────────────────────────────────────

export const getConnectedRepos = asyncHandler(async (req, res) => {
    const octokit = await githubService.getUserOctokit(req.user._id);
    const { data } = await octokit.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 30,
        affiliation: "owner,collaborator",
    });

    const repos = data.map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        owner: r.owner.login,
        description: r.description,
        private: r.private,
        cloneUrl: r.clone_url,
    }));

    res.status(200).json(ApiResponse.ok(repos));
});

export const createBranch = asyncHandler(async (req, res) => {
    const { workspaceId, owner, repo, baseBranch = "main" } = req.body;
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw new NotFoundError("Workspace");

    const issueId = workspace.issue.toString().slice(-6);
    const branchName = `bloody-roar/issue-${issueId}`;

    const result = await githubService.createBranch(req.user._id, owner, repo, baseBranch, branchName);

    // Update workspace
    workspace.githubRepo = {
        owner,
        repo,
        fullName: `${owner}/${repo}`,
        cloneUrl: `https://github.com/${owner}/${repo}.git`,
    };
    workspace.branch = { name: branchName, baseBranch, createdAt: new Date() };
    await workspace.save();

    await Audit.create({
        action: "BRANCH_CREATE",
        actor: req.user._id,
        issue: workspace.issue,
        workspace: workspace._id,
        metadata: { branchName, baseBranch, repo: `${owner}/${repo}` },
    });

    res.status(200).json(ApiResponse.ok(result, "Branch created"));
});

export const commitAndPush = asyncHandler(async (req, res) => {
    const { workspaceId, message, filePaths } = req.body;
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw new NotFoundError("Workspace");
    if (!workspace.githubRepo?.owner) throw new Error("No GitHub repo linked");

    const { owner, repo } = workspace.githubRepo;
    const branch = workspace.branch.name;

    const filesToCommit = filePaths
        ? workspace.files.filter((f) => filePaths.includes(f.path))
        : workspace.files;

    if (filesToCommit.length === 0) throw new Error("No files to commit");

    const newCommit = await githubService.commitFiles(req.user._id, owner, repo, branch, filesToCommit, message);

    workspace.commits.push({
        sha: newCommit.sha,
        message: newCommit.message,
        author: req.user.name || req.user.github?.username,
        timestamp: new Date(),
    });
    await workspace.save();

    await Audit.create({
        action: "COMMIT",
        actor: req.user._id,
        issue: workspace.issue,
        workspace: workspace._id,
        metadata: { commitSha: newCommit.sha, message, filesChanged: filesToCommit.length },
    });

    res.status(200).json(ApiResponse.ok({ sha: newCommit.sha, message: newCommit.message }, "Changes pushed"));
});

export const getRepoDataFromIssue = asyncHandler(async (req, res) => {
    const issue = await Issue.findById(req.params.issueId).select("githubRepoUrl title");
    if (!issue) throw new NotFoundError("Issue");
    if (!issue.githubRepoUrl) throw new Error("No GitHub repo linked to this issue");

    const { owner, repo } = githubService.parseRepoUrl(issue.githubRepoUrl);
    const octokit = await githubService.getOctokit(req.user?._id);

    // Parallel fetch
    const [repoInfo, prsData] = await Promise.allSettled([
        octokit.repos.get({ owner, repo }),
        octokit.pulls.list({ owner, repo, state: "all", per_page: 10, direction: "desc" }),
    ]);

    const result = {
        repo: repoInfo.status === "fulfilled" ? repoInfo.value.data : null,
        pullRequests: prsData.status === "fulfilled" ? prsData.value.data : [],
    };

    res.status(200).json(ApiResponse.ok(result));
});

export const createPullRequest = asyncHandler(async (req, res) => {
    const { workspaceId, title, body } = req.body;
    const octokit = await githubService.getUserOctokit(req.user._id);

    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw new NotFoundError("Workspace");

    const { owner, repo } = workspace.githubRepo;
    const pr = await octokit.pulls.create({
        owner,
        repo,
        title: title || `[Bloody Roar] Work submission for ${workspace.name}`,
        body: body || `This PR was created via Bloody Roar Platform.`,
        head: workspace.branch.name,
        base: workspace.branch.baseBranch,
    });

    workspace.pullRequest = { number: pr.data.number, url: pr.data.html_url, state: "open" };
    await workspace.save();

    res.status(200).json(ApiResponse.ok(pr.data, "Pull request created successfully"));
});
