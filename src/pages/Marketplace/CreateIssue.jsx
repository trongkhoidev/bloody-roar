import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PlusCircle, DollarSign, Github, AlertCircle } from "lucide-react";

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
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-gray-500">Only authorized Clients can post issues.</p>
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
            alert(error.response?.data?.message || "Failed to create issue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <PlusCircle className="text-red-600" />
                Post a New Bounty
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                        placeholder="e.g. Fix memory leak in payment module"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            name="category"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Comma Separated)</label>
                        <input
                            type="text"
                            name="tags"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                            placeholder="React, Node.js, Security"
                            value={formData.tags}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Budget (ETH)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="number"
                                name="budget"
                                required
                                min="0"
                                step="0.01"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                                placeholder="0.5"
                                value={formData.budget}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Github Repository URL</label>
                    <div className="relative">
                        <Github className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="url"
                            name="githubRepoUrl"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                            placeholder="https://github.com/username/repo"
                            value={formData.githubRepoUrl}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        required
                        rows="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                        placeholder="Describe the issue in detail... (Paste images here)"
                        value={formData.description}
                        onChange={handleChange}
                        onPaste={handlePaste}
                    />
                </div>

                {/* Attachments Preview */}
                {formData.attachments.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                        {formData.attachments.map((url, idx) => (
                            <div key={idx} className="relative group">
                                <img src={`http://localhost:3000${url}`} alt="Preview" className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }))}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* File Upload Button */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-700 transition disabled:opacity-50 shadow-lg shadow-red-200"
                    >
                        {isLoading ? "Posting..." : "Post Bounty"}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Funds will be held in Smart Contract upon confirmation.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default CreateIssue;
