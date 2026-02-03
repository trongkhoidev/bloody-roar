import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PlusCircle, DollarSign, Github, AlertCircle, Upload, X, FileText, Tag, Folder, Loader2 } from "lucide-react";

const CreateIssue = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Web",
        budget: "",
        tags: "",
        githubRepoUrl: "",
        attachments: []
    });

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const uploadedUrls = [];
        for (const file of files) {
            const data = new FormData();
            data.append('file', file);
            try {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, data);
                uploadedUrls.push(res.data.data.url);
            } catch (err) {
                console.error("Upload failed", err);
            }
        }
        setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...uploadedUrls] }));
    };

    const handlePaste = async (e) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.indexOf("image") !== -1) {
                const blob = item.getAsFile();
                const data = new FormData();
                data.append('file', blob);
                try {
                    const res = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, data);
                    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, res.data.data.url] }));
                } catch (err) {
                    console.error("Paste upload failed", err);
                }
            }
        }
    };

    if (user?.role !== 'CLIENT') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={40} className="text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                <p className="text-slate-400 max-w-md">Only verified clients can post bounties. Please register as a client to continue.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="mt-6 px-6 py-3 bg-[#334155] hover:bg-[#475569] text-white rounded-xl font-medium transition-colors"
                >
                    Return to Marketplace
                </button>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
            };

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/issues`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (res.data.success) {
                navigate(`/issue/${res.data.data._id}`);
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create bounty");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <PlusCircle className="text-indigo-400" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Post a New Bounty</h2>
                </div>
                <p className="text-slate-400">Create a bounty for developers to solve. Funds are secured via smart contract.</p>
            </div>

            {/* Form Card */}
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                            <FileText size={16} className="text-slate-400" />
                            Bounty Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            className="w-full px-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            placeholder="e.g. Fix memory leak in payment module"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Category & Tags Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                                <Folder size={16} className="text-slate-400" />
                                Category
                            </label>
                            <select
                                name="category"
                                className="w-full px-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-all"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="Web">Web Development</option>
                                <option value="Mobile">Mobile App</option>
                                <option value="Blockchain">Blockchain</option>
                                <option value="AI">AI / Machine Learning</option>
                                <option value="Game">Game Development</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                                <Tag size={16} className="text-slate-400" />
                                Tags (Comma Separated)
                            </label>
                            <input
                                type="text"
                                name="tags"
                                className="w-full px-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                placeholder="React, Node.js, Security"
                                value={formData.tags}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Budget & GitHub Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                                <DollarSign size={16} className="text-amber-400" />
                                Bounty Amount (ETH)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="budget"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    placeholder="0.5"
                                    value={formData.budget}
                                    onChange={handleChange}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">ETH</span>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                                <Github size={16} className="text-slate-400" />
                                GitHub Repository (Optional)
                            </label>
                            <input
                                type="url"
                                name="githubRepoUrl"
                                className="w-full px-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                placeholder="https://github.com/username/repo"
                                value={formData.githubRepoUrl}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                            <FileText size={16} className="text-slate-400" />
                            Description
                        </label>
                        <textarea
                            name="description"
                            required
                            rows="6"
                            className="w-full px-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all"
                            placeholder="Describe the issue in detail. You can also paste images directly here..."
                            value={formData.description}
                            onChange={handleChange}
                            onPaste={handlePaste}
                        />
                        <p className="text-xs text-slate-500 mt-2">Tip: Paste images directly or use the upload button below</p>
                    </div>

                    {/* Attachments Preview */}
                    {formData.attachments.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-3 block">Attached Files</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {formData.attachments.map((url, idx) => (
                                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#334155]">
                                        <img 
                                            src={`http://localhost:3000${url}`} 
                                            alt="Preview" 
                                            className="w-full h-24 object-cover" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ 
                                                ...prev, 
                                                attachments: prev.attachments.filter((_, i) => i !== idx) 
                                            }))}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* File Upload */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                            <Upload size={16} className="text-slate-400" />
                            Attachments
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                            />
                            <label 
                                htmlFor="file-upload"
                                className="flex items-center justify-center gap-3 w-full p-6 border-2 border-dashed border-[#334155] rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-all group"
                            >
                                <div className="p-3 bg-[#334155] rounded-xl group-hover:bg-indigo-500/10 transition-colors">
                                    <Upload size={24} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-medium">Click to upload files</p>
                                    <p className="text-sm text-slate-400">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-6 border-t border-[#334155]">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/25 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Creating Bounty...
                                </>
                            ) : (
                                <>
                                    <PlusCircle size={20} />
                                    Post Bounty
                                </>
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-4">
                            Funds will be held in Smart Contract upon developer approval.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateIssue;
