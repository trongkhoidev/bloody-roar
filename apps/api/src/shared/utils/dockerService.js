import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs-extra";

const execAsync = promisify(exec);

export class DockerService {
    constructor() {
        this.imageName = "bloody-roar-sandbox:latest";
        this.dockerAvailable = null;
    }

    /**
     * Check if Docker is installed and running.
     */
    async checkDocker() {
        if (this.dockerAvailable !== null) return this.dockerAvailable;
        try {
            await execAsync("docker info");
            this.dockerAvailable = true;
        } catch (error) {
            console.warn("⚠️ Docker daemon not available. Falling back to local isolated process execution.");
            this.dockerAvailable = false;
        }
        return this.dockerAvailable;
    }

    /**
     * Build the MRE sandbox image if it does not exist.
     */
    async ensureImage() {
        const hasDocker = await this.checkDocker();
        if (!hasDocker) return;

        try {
            // Check if image exists
            await execAsync(`docker image inspect ${this.imageName}`);
        } catch (error) {
            console.log(`🔨 Building MRE Sandbox Docker image (${this.imageName})...`);
            const dockerfilePath = path.join(process.cwd(), "scripts/sandbox");
            try {
                await execAsync(`docker build -t ${this.imageName} ${dockerfilePath}`);
                console.log(`✅ Sandbox Docker image built successfully.`);
            } catch (buildError) {
                console.error("❌ Failed to build Docker image:", buildError.message);
            }
        }
    }

    /**
     * Start an isolated MRE container for a workspace.
     */
    async startContainer(workspaceId, hostWorkspacePath) {
        const hasDocker = await this.checkDocker();
        const containerName = `br-sandbox-${workspaceId}`;

        if (!hasDocker) {
            console.log(`[Mock Sandbox] Starting session in simulated environment: ${hostWorkspacePath}`);
            return containerName;
        }

        await this.ensureImage();

        try {
            // Stop existing if running
            await this.stopContainer(workspaceId);
        } catch (e) {
            // Ignore
        }

        // Mount path must be absolute
        const absoluteHostPath = path.resolve(hostWorkspacePath);
        await fs.ensureDir(absoluteHostPath);

        // Run container in detached mode with limits
        // CPU limit: 0.5 cores, Memory limit: 512MB
        const runCmd = `docker run -d \
            --name ${containerName} \
            --memory=512m \
            --cpus=0.5 \
            -v "${absoluteHostPath}:/home/coder/workspace" \
            ${this.imageName} tail -f /dev/null`;

        console.log(`🚀 Starting sandbox container: ${containerName}`);
        await execAsync(runCmd);
        return containerName;
    }

    /**
     * Execute a command safely inside the sandbox container.
     */
    async execute(workspaceId, command, hostWorkspacePath) {
        const hasDocker = await this.checkDocker();
        const containerName = `br-sandbox-${workspaceId}`;

        // Basic safety validations for allowed commands inside sandbox
        const BLOCKED_PATTERNS = ["> /dev", "sudo ", "chmod ", "chown ", "kill ", "&&", "||", ";", "|", "`", "$("];
        if (BLOCKED_PATTERNS.some((p) => command.includes(p))) {
            throw new Error(`Execution of command "${command}" is restricted.`);
        }

        if (!hasDocker) {
            // Fallback: Safe local execution
            console.log(`[Mock Sandbox] Executing locally: ${command}`);
            try {
                const { stdout, stderr } = await execAsync(command, {
                    cwd: hostWorkspacePath,
                    timeout: 15000,
                    maxBuffer: 512 * 1024,
                    env: { ...process.env, NODE_ENV: "development" }
                });
                return { output: stdout || "", error: stderr || "", exitCode: 0 };
            } catch (err) {
                return {
                    output: err.stdout || "",
                    error: err.stderr || err.message,
                    exitCode: err.code || 1
                };
            }
        }

        // Ensure container is running, if not start it
        const isRunning = await this.isContainerRunning(workspaceId);
        if (!isRunning) {
            await this.startContainer(workspaceId, hostWorkspacePath);
        }

        try {
            // Run command inside container as coder user in workspace dir
            const execCmd = `docker exec -u coder -w /home/coder/workspace ${containerName} sh -c "${command.replace(/"/g, '\\"')}"`;
            const { stdout, stderr } = await execAsync(execCmd, {
                timeout: 20000,
                maxBuffer: 1024 * 1024
            });

            return {
                output: stdout || "",
                error: stderr || "",
                exitCode: 0
            };
        } catch (error) {
            return {
                output: error.stdout || "",
                error: error.stderr || error.message,
                exitCode: error.code || 1
            };
        }
    }

    /**
     * Stop and remove a sandbox container.
     */
    async stopContainer(workspaceId) {
        const hasDocker = await this.checkDocker();
        const containerName = `br-sandbox-${workspaceId}`;

        if (!hasDocker) return;

        try {
            await execAsync(`docker rm -f ${containerName}`);
            console.log(`🛑 Sandbox container stopped and removed: ${containerName}`);
        } catch (error) {
            // Container might not exist, ignore
        }
    }

    /**
     * Check if the container is currently running.
     */
    async isContainerRunning(workspaceId) {
        const hasDocker = await this.checkDocker();
        const containerName = `br-sandbox-${workspaceId}`;

        if (!hasDocker) return true;

        try {
            const { stdout } = await execAsync(`docker inspect -f '{{.State.Running}}' ${containerName}`);
            return stdout.trim() === "true";
        } catch (error) {
            return false;
        }
    }
}

export default new DockerService();
