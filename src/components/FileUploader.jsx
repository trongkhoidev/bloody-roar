import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, File, AlertTriangle, CheckCircle, X, Loader2 } from 'lucide-react';

const FileUploader = ({ issueId, userId, socket, onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [flaggedFiles, setFlaggedFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (file) => {
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.zip')) {
            setError('Only .zip files are allowed');
            return;
        }

        // Validate file size (50MB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('File size must be less than 50MB');
            return;
        }

        await uploadWorkspace(file);
    };

    const uploadWorkspace = async (file) => {
        setUploading(true);
        setError('');
        setProgress(0);
        setFlaggedFiles([]);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('issueId', issueId);
            formData.append('userId', userId);

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/workspace/upload`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(percentCompleted);
                    }
                }
            );

            const workspaceData = response.data.data;

            // Check for flagged files
            if (workspaceData.flaggedFiles && workspaceData.flaggedFiles.length > 0) {
                setFlaggedFiles(workspaceData.flaggedFiles);
            }

            // Emit socket event to notify other users
            socket.emit('workspace_upload', {
                issueId,
                workspaceData: {
                    ...workspaceData,
                    uploadedBy: userId
                }
            });

            // Callback to parent component
            if (onUploadComplete) {
                onUploadComplete(workspaceData);
            }

            // Reset after 2 seconds
            setTimeout(() => {
                setUploading(false);
                setProgress(0);
            }, 2000);

        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Failed to upload workspace');
            setUploading(false);
            setProgress(0);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            {/* Drag & Drop Zone */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragActive
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleChange}
                    className="hidden"
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 size={48} className="text-red-600 animate-spin" />
                        <div className="w-full max-w-xs">
                            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-red-600 h-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">Uploading... {progress}%</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-700 mb-2">
                            Drop your .zip file here
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            or click to browse (Max 50MB)
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                            Select File
                        </button>
                    </>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-medium text-red-800">Upload Failed</p>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                    <button
                        onClick={() => setError('')}
                        className="text-red-400 hover:text-red-600"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* AI Guard Warnings */}
            {flaggedFiles.length > 0 && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-2">
                        <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-yellow-800">
                                ⚠️ AI Guard: Sensitive Data Detected
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                                The following files contain potentially sensitive information:
                            </p>
                        </div>
                    </div>
                    <ul className="ml-8 mt-2 space-y-1">
                        {flaggedFiles.map((file, index) => (
                            <li key={index} className="text-sm text-yellow-700">
                                <File size={14} className="inline mr-2" />
                                <strong>{file.path}</strong>: {file.reason}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Success Message */}
            {progress === 100 && !error && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-600" />
                    <p className="text-green-800 font-medium">Workspace uploaded successfully!</p>
                </div>
            )}
        </div>
    );
};

export default FileUploader;
