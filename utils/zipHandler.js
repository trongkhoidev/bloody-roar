import AdmZip from 'adm-zip';
import fs from 'fs-extra';
import path from 'path';

/**
 * Detect programming language from file extension
 */
export const detectLanguage = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    const langMap = {
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.py': 'python',
        '.java': 'java',
        '.cpp': 'cpp',
        '.c': 'c',
        '.h': 'cpp',
        '.hpp': 'cpp',
        '.cs': 'csharp',
        '.php': 'php',
        '.rb': 'ruby',
        '.go': 'go',
        '.rs': 'rust',
        '.swift': 'swift',
        '.kt': 'kotlin',
        '.html': 'html',
        '.css': 'css',
        '.scss': 'scss',
        '.sass': 'sass',
        '.json': 'json',
        '.xml': 'xml',
        '.yaml': 'yaml',
        '.yml': 'yaml',
        '.md': 'markdown',
        '.sql': 'sql',
        '.sh': 'shell',
        '.bash': 'shell',
        '.bat': 'bat',
        '.ps1': 'powershell'
    };
    
    return langMap[ext] || 'plaintext';
};

/**
 * Validate zip file entry for security
 */
const isValidPath = (entryPath) => {
    // Prevent path traversal attacks
    const normalized = path.normalize(entryPath);
    return !normalized.includes('..') && 
           !path.isAbsolute(normalized) &&
           !entryPath.startsWith('/') &&
           !entryPath.includes('\\..\\');
};

/**
 * Check if file should be ignored
 */
const shouldIgnore = (filename) => {
    const ignorePatterns = [
        /node_modules/,
        /\.git/,
        /\.DS_Store/,
        /package-lock\.json/,
        /yarn\.lock/,
        /\.env$/,
        /\.log$/,
        /dist\//,
        /build\//,
        /\.next\//,
        /__pycache__/,
        /\.pyc$/,
        /\.class$/,
        /\.o$/,
        /\.exe$/,
        /\.dll$/
    ];
    
    return ignorePatterns.some(pattern => pattern.test(filename));
};

/**
 * Extract zip file and return file structure
 */
export const extractZip = async (zipPath, outputDir, options = {}) => {
    const maxFiles = options.maxFiles || 500;
    const maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5MB per file
    
    try {
        // Ensure output directory exists
        await fs.ensureDir(outputDir);
        
        const zip = new AdmZip(zipPath);
        const entries = zip.getEntries();
        
        const files = [];
        let fileCount = 0;
        let totalSize = 0;
        
        for (const entry of entries) {
            // Skip directories
            if (entry.isDirectory) continue;
            
            // Validate path
            if (!isValidPath(entry.entryName)) {
                console.warn(`⚠️ Skipping suspicious path: ${entry.entryName}`);
                continue;
            }
            
            // Skip ignored files
            if (shouldIgnore(entry.entryName)) {
                continue;
            }
            
            // Check file count limit
            if (fileCount >= maxFiles) {
                throw new Error(`File count limit exceeded (max: ${maxFiles})`);
            }
            
            // Check file size
            const fileSize = entry.header.size;
            if (fileSize > maxFileSize) {
                console.warn(`⚠️ Skipping large file: ${entry.entryName} (${fileSize} bytes)`);
                continue;
            }
            
            fileCount++;
            totalSize += fileSize;
            
            const filePath = entry.entryName;
            const content = entry.getData().toString('utf8');
            const language = detectLanguage(filePath);
            
            files.push({
                path: filePath,
                content: content,
                language: language,
                size: fileSize
            });
        }
        
        // Extract to filesystem
        zip.extractAllTo(outputDir, true);
        
        return {
            files,
            fileCount,
            totalSize,
            fileTree: buildFileTree(files)
        };
    } catch (error) {
        throw new Error(`Failed to extract zip: ${error.message}`);
    }
};

/**
 * Build hierarchical file tree structure
 */
export const buildFileTree = (files) => {
    const root = {
        name: 'root',
        type: 'directory',
        children: []
    };
    
    for (const file of files) {
        const parts = file.path.split('/');
        let current = root;
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLast = i === parts.length - 1;
            
            if (isLast) {
                // This is a file
                current.children.push({
                    name: part,
                    type: 'file',
                    path: file.path,
                    language: file.language,
                    size: file.size
                });
            } else {
                // This is a directory
                let dir = current.children.find(c => c.name === part && c.type === 'directory');
                if (!dir) {
                    dir = {
                        name: part,
                        type: 'directory',
                        children: []
                    };
                    current.children.push(dir);
                }
                current = dir;
            }
        }
    }
    
    // Sort children: directories first, then files alphabetically
    const sortChildren = (node) => {
        if (node.children) {
            node.children.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'directory' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });
            node.children.forEach(sortChildren);
        }
    };
    
    sortChildren(root);
    
    return root.children;
};

/**
 * Create zip from workspace directory
 */
export const createZip = async (sourceDir, outputPath) => {
    try {
        const zip = new AdmZip();
        
        // Add directory to zip
        zip.addLocalFolder(sourceDir);
        
        // Write zip file
        await zip.writeZipPromise(outputPath);
        
        return outputPath;
    } catch (error) {
        throw new Error(`Failed to create zip: ${error.message}`);
    }
};

/**
 * Cleanup workspace directory
 */
export const cleanupWorkspace = async (workspaceDir) => {
    try {
        await fs.remove(workspaceDir);
        console.log(`🗑️ Cleaned up workspace: ${workspaceDir}`);
    } catch (error) {
        console.error(`Failed to cleanup workspace: ${error.message}`);
    }
};
