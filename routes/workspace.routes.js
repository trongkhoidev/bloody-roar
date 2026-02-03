import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import Workspace from '../models/workspace.model.js';
import { extractZip, createZip, cleanupWorkspace } from '../utils/zipHandler.js';
import { scanContent } from '../utils/aiScanner.js';

const router = express.Router();

// Ensure workspaces directory exists
const workspacesDir = 'uploads/workspaces';
fs.ensureDirSync(workspacesDir);

// Storage Config for workspace uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/temp');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File Filter for zip files
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'application/zip',
        'application/x-zip-compressed',
        'application/octet-stream'
    ];
    
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.zip')) {
        cb(null, true);
    } else {
        cb(new Error('Only .zip files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: fileFilter
});

// @route   POST /api/workspace/upload
// @desc    Upload and extract workspace
// @access  Authenticated
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { issueId, userId } = req.body;
        
        if (!issueId || !userId) {
            return res.status(400).json({ message: 'issueId and userId are required' });
        }

        // Generate unique workspace ID
        const workspaceId = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const workspaceDir = path.join(workspacesDir, workspaceId);

        // Extract zip
        console.log('📦 Extracting zip:', req.file.path);
        const extracted = await extractZip(req.file.path, workspaceDir, {
            maxFiles: 500,
            maxFileSize: 5 * 1024 * 1024
        });

        // AI Guard scan for sensitive data
        let flaggedFiles = [];
        for (const file of extracted.files) {
            const scanResult = scanContent(file.content);
            if (scanResult.flagged) {
                flaggedFiles.push({
                    path: file.path,
                    reason: scanResult.reason
                });
            }
        }

        // Create workspace document
        const workspace = await Workspace.create({
            issue: issueId,
            uploadedBy: userId,
            workspaceId: workspaceId,
            name: req.file.originalname.replace('.zip', ''),
            files: extracted.files,
            fileCount: extracted.fileCount,
            totalSize: extracted.totalSize,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        // Clean up temp upload
        await fs.remove(req.file.path);

        console.log(`✅ Workspace created: ${workspaceId} (${extracted.fileCount} files)`);

        res.status(200).json({
            success: true,
            data: {
                workspaceId: workspace.workspaceId,
                name: workspace.name,
                fileCount: workspace.fileCount,
                totalSize: workspace.totalSize,
                fileTree: extracted.fileTree,
                flaggedFiles: flaggedFiles.length > 0 ? flaggedFiles : undefined,
                createdAt: workspace.createdAt
            }
        });
    } catch (error) {
        console.error('Workspace upload error:', error);
        res.status(500).json({ 
            message: 'Failed to upload workspace', 
            error: error.message 
        });
    }
});

// @route   GET /api/workspace/:workspaceId
// @desc    Get workspace metadata
// @access  Authenticated
router.get('/:workspaceId', async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ 
            workspaceId: req.params.workspaceId 
        }).select('-files.content'); // Don't send full content

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                workspaceId: workspace.workspaceId,
                name: workspace.name,
                fileCount: workspace.fileCount,
                totalSize: workspace.totalSize,
                files: workspace.files.map(f => ({
                    path: f.path,
                    language: f.language,
                    size: f.size
                })),
                createdAt: workspace.createdAt,
                expiresAt: workspace.expiresAt
            }
        });
    } catch (error) {
        console.error('Get workspace error:', error);
        res.status(500).json({ message: 'Failed to get workspace', error: error.message });
    }
});

// @route   GET /api/workspace/:workspaceId/file/*
// @desc    Get specific file content
// @access  Authenticated
// Using regex to match workspace ID and file path due to path-to-regexp v8 limitations
router.get(/^\/([^\/]+)\/file\/(.+)$/, async (req, res) => {
    try {
        const workspaceId = req.params[0];
        const filePath = req.params[1];

        const workspace = await Workspace.findOne({ workspaceId });

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        const file = workspace.files.find(f => f.path === filePath);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                path: file.path,
                content: file.content,
                language: file.language,
                size: file.size
            }
        });
    } catch (error) {
        console.error('Get file error:', error);
        res.status(500).json({ message: 'Failed to get file', error: error.message });
    }
});

// @route   PUT /api/workspace/:workspaceId/file/*
// @desc    Update file content
// @access  Authenticated
// Using regex to match workspace ID and file path due to path-to-regexp v8 limitations
router.put(/^\/([^\/]+)\/file\/(.+)$/, async (req, res) => {
    try {
        const workspaceId = req.params[0];
        const filePath = req.params[1];
        const { content } = req.body;

        if (content === undefined) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const workspace = await Workspace.findOne({ workspaceId });

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        const fileIndex = workspace.files.findIndex(f => f.path === filePath);

        if (fileIndex === -1) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Update file content
        workspace.files[fileIndex].content = content;
        workspace.files[fileIndex].size = Buffer.byteLength(content, 'utf8');
        
        await workspace.save();

        res.status(200).json({
            success: true,
            data: {
                path: workspace.files[fileIndex].path,
                size: workspace.files[fileIndex].size
            }
        });
    } catch (error) {
        console.error('Update file error:', error);
        res.status(500).json({ message: 'Failed to update file', error: error.message });
    }
});

// @route   POST /api/workspace/:workspaceId/download
// @desc    Download workspace as zip
// @access  Authenticated
router.post('/:workspaceId/download', async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ 
            workspaceId: req.params.workspaceId 
        });

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        const workspaceDir = path.join(workspacesDir, workspace.workspaceId);
        const zipPath = path.join('uploads/temp', `${workspace.name}-${Date.now()}.zip`);

        // Create zip from workspace directory
        await createZip(workspaceDir, zipPath);

        // Send file
        res.download(zipPath, `${workspace.name}.zip`, async (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            // Clean up temp zip
            await fs.remove(zipPath);
        });
    } catch (error) {
        console.error('Download workspace error:', error);
        res.status(500).json({ message: 'Failed to download workspace', error: error.message });
    }
});

// @route   DELETE /api/workspace/:workspaceId
// @desc    Delete workspace
// @access  Authenticated
router.delete('/:workspaceId', async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ 
            workspaceId: req.params.workspaceId 
        });

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Delete from database
        await Workspace.deleteOne({ workspaceId: req.params.workspaceId });

        // Clean up filesystem
        const workspaceDir = path.join(workspacesDir, workspace.workspaceId);
        await cleanupWorkspace(workspaceDir);

        res.status(200).json({
            success: true,
            message: 'Workspace deleted successfully'
        });
    } catch (error) {
        console.error('Delete workspace error:', error);
        res.status(500).json({ message: 'Failed to delete workspace', error: error.message });
    }
});

export default router;
