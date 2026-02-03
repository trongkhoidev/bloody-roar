import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
    PlusCircle, DollarSign, Github, AlertCircle, Upload, X, FileText, 
    Tag, Folder, Loader2, ArrowLeft, Zap, Globe, Cpu, Sparkles, 
    Smartphone, Gamepad2, CheckCircle
} from "lucide-react";

const CreateIssue = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Web",
        budget: "",
        tags: "",
        githubRepoUrl: "",
        attachments: []
    });

    const categories = [
        { value: "Web", label: "Web Dev", icon: <Globe size={18} /> },
        { value: "Blockchain", label: "Blockchain", icon: <Cpu size={18} /> },
        { value: "AI", label: "AI / ML", icon: <Sparkles size={18} /> },
        { value: "Mobile", label: "Mobile", icon: <Smartphone size={18} /> },
        { value: "Game", label: "Game Dev", icon: <Gamepad2 size={18} /> },
    ];

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

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files);
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
        }
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
            <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
                <div className="w-14 h-14 bg-[#171717] rounded-full flex items-center justify-center mb-4 border border-[#262626]">
                    <AlertCircle size={24} className="text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                <p className="text-[#a1a1aa] text-[14px] max-w-md mb-6">Only verified clients can post bounties. Please register as a client to continue.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="px-5 py-2.5 bg-[#171717] border border-[#262626] text-white rounded-lg font-medium text-[13px] hover:border-[#404040] transition-colors"
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
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Back Button */}
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-[#a1a1aa] hover:text-white transition-colors text-[13px] group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                Back
            </button>

            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <Zap size={24} className="text-black" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Post a Bounty</h1>
                    <p className="text-[#a1a1aa] text-[14px]">Create a new bounty for developers to work on</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-5">
                    <label className="block text-[13px] font-medium text-[#a1a1aa] mb-2">
                        Bounty Title <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="w-full px-4 py-3 bg-[#171717] border border-[#262626] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#404040] transition-all text-[14px]"
                        placeholder="e.g., Fix authentication bug in React app"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                {/* Category */}
                <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-5">
                    <label className="block text-[13px] font-medium text-[#a1a1aa] mb-3">
                        Category <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, category: cat.value })}
                                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                                    formData.category === cat.value
                                        ? 'bg-white text-black border-white'
                                        : 'bg-[#171717] text-[#a1a1aa] border-[#262626] hover:border-[#404040]'
                                }`}
                            >
                                {cat.icon}
                                <span className="text-[11px] font-medium">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Budget & Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-5">
                        <label className="block text-[13px] font-medium text-[#a1a1aa] mb-2">
                            Bounty Amount <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f5a623]" />
                            <input
                                type="number"
                                name="budget"
                                required
                                min="0"
                                step="0.001"
                                className="w-full pl-10 pr-16 py-3 bg-[#171717] border border-[#262626] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#404040] transition-all text-[14px]"
                                placeholder="0.00"
                                value={formData.budget}
                                onChange={handleChange}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717a] text-[13px] font-medium">ETH</span>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-5">
                        <label className="block text-[13px] font-medium text-[#a1a1aa] mb-2">
                            Skills / Tags
                        </label>
                        <input
                            type="text"
                            name="tags"
                            className="w-full px-4 py-3 bg-[#171717] border border-[#262626] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#404040] transition-all text-[14px]"
                            placeholder="React, Node.js, Security"
                            value={formData.tags}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* GitHub */}
                <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-5">
                    <label className="block text-[13px] font-medium text-[#a1a1aa] mb-2">
                        GitHub Repository (Optional)
                    </label>
                    <div className="relative">
                        <Github size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717a]" />
                        <input
                            type="url"
                            name="githubRepoUrl"
                            className="w-full pl-10 pr-4 py-3 bg-[#171717] border border-[#262626] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#404040] transition-all text-[14px]"
                            placeholder="https://github.com/username/repo"
                            value={formData.githubRepoUrl}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-5">
                    <label className="block text-[13px] font-medium text-[#a1a1aa] mb-2">
                        Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        name="description"
                        required
                        rows="6"
                        className="w-full px-4 py-3 bg-[#171717] border border-[#262626] rounded-lg text-white placeholder-[#71717a] focus:outline-none focus:border-[#404040] resize-none transition-all text-[14px] leading-relaxed"
                        placeholder="Describe the task in detail. Include requirements, expected deliverables, and any technical specifications. You can also paste images directly here..."
                        value={formData.description}
                        onChange={handleChange}
                        onPaste={handlePaste}
                    />
                    <p className="text-[11px] text-[#71717a] mt-2">Tip: Paste images directly or use the upload section below</p>
                </div>

                {/* Attachments Preview */}
                {formData.attachments.length > 0 && (
                    <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-5">
                        <label className="block text-[13px] font-medium text-[#a1a1aa] mb-3">Attached Files</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {formData.attachments.map((url, idx) => (
                                <div key={idx} className="relative group rounded-lg overflow-hidden border border-[#262626]">
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
                                        className="absolute top-2 right-2 bg-black/70 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* File Upload */}
                <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-5">
                    <label className="block text-[13px] font-medium text-[#a1a1aa] mb-3">
                        Attachments
                    </label>
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                            dragActive 
                                ? 'border-[#0070f3] bg-[#0070f3]/5' 
                                : 'border-[#262626] hover:border-[#404040]'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload size={24} className="mx-auto mb-3 text-[#71717a]" />
                        <p className="text-[#a1a1aa] text-[14px] mb-1">Drop files here or click to upload</p>
                        <p className="text-[#71717a] text-[12px]">PNG, JPG, GIF up to 10MB</p>
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
                            className="inline-block mt-4 px-4 py-2 bg-[#171717] border border-[#262626] rounded-lg text-[13px] text-[#a1a1aa] hover:text-white hover:border-[#404040] cursor-pointer transition-all"
                        >
                            Browse Files
                        </label>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-transparent border border-[#262626] text-[#a1a1aa] rounded-lg font-medium text-[14px] hover:border-[#404040] hover:text-white transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-white text-black px-6 py-3 rounded-lg font-medium text-[14px] hover:bg-[#e5e5e5] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={16} />
                                Publishing...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={16} />
                                Publish Bounty
                            </>
                        )}
                    </button>
                </div>

                <p className="text-center text-[11px] text-[#71717a]">
                    Funds will be held in Smart Contract upon developer approval.
                </p>
            </form>
        </div>
    );
};

export default CreateIssue;
