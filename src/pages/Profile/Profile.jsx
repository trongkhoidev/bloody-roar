import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { User, Mail, Camera, Save, Briefcase, Github, Linkedin, AlertTriangle, CheckCircle, Wallet } from "lucide-react";
import Loader from "../../components/Loader";

const Profile = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        githubUrl: "",
        linkedin: "",
        skills: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                githubUrl: user.githubUrl || "",
                linkedin: user.linkedin || "",
                skills: user.skills ? user.skills.join(", ") : ""
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            setLoading(true);
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, uploadData);
            const avatarUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}${res.data.data.url}`;

            // Immediately update avatar
            const updateRes = await axios.put(`${import.meta.env.VITE_API_URL}/auth/profile`, {
                avatar: avatarUrl
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            setUser({ ...user, ...updateRes.data.data }); // Update context
            setMessage({ type: "success", text: "Avatar updated successfully!" });
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Failed to update avatar" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            const updateData = {
                ...formData,
                skills: formData.skills.split(",").map(s => s.trim()).filter(s => s)
            };

            const res = await axios.put(`${import.meta.env.VITE_API_URL}/auth/profile`, updateData, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            setUser({ ...user, ...res.data.data }); // Update context
            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile" });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <Loader />;

    return (
        <div className="max-w-4xl mx-auto py-10 animate-fade-in">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-8 flex items-center gap-2">
                <User size={32} className="text-red-500" />
                Profile Settings
            </h2>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">

                {/* Left Side: Avatar & Identity */}
                <div className="w-full md:w-1/3 bg-gray-50 p-8 flex flex-col items-center border-r border-gray-100 text-center">
                    <div className="relative group w-40 h-40 mb-4">
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white flex-col">
                            <Camera size={24} />
                            <span className="text-xs mt-1">Change Photo</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                        </label>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                    <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold mt-2">
                        {user.role}
                    </span>

                    {user.walletAddress && (
                        <div className="mt-6 w-full bg-white p-3 rounded-lg border border-gray-200 text-left">
                            <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                                <Wallet size={12} /> Wallet Connected
                            </p>
                            <p className="font-mono text-xs break-all text-gray-600">{user.walletAddress}</p>
                        </div>
                    )}
                </div>

                {/* Right Side: Edit Form */}
                <div className="w-full md:w-2/3 p-8">
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <User size={16} /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Mail size={16} /> Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={true} // Email is immutable for now or handled carefully
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Briefcase size={16} /> Skills (comma separated)
                            </label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                placeholder="React, NodeJS, Solidity..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Github size={16} /> GitHub Profile
                                </label>
                                <input
                                    type="text"
                                    name="githubUrl"
                                    value={formData.githubUrl}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                    placeholder="https://github.com/..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Linkedin size={16} /> LinkedIn Profile
                                </label>
                                <input
                                    type="text"
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-200 flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? "Saving..." : <><Save size={20} /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
