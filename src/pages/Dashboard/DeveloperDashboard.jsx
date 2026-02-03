import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext"; // Import ChatContext
import { LayoutDashboard, ExternalLink, Clock, CheckCircle, XCircle } from "lucide-react";
import Loader from "../../components/Loader";

const DeveloperDashboard = () => {
    const { user } = useAuth();
    const { openChat } = useChat(); // Use hook
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMyApplications();
        }
    }, [user]);

    const fetchMyApplications = async () => {
        try {
            const res = await axios.get("/api/issues/my/applications", {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setApplications(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader text="Loading your applications..." />;

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <LayoutDashboard className="text-red-600" />
                My Applications
            </h2>

            {applications.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
                    <Link to="/" className="text-orange-600 font-bold hover:underline">Browse Market</Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {applications.map((app) => (
                        <div key={app._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{app.issue?.title || "Unknown Issue"}</h3>
                                <div className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} /> Applied on {new Date(app.appliedAt).toLocaleDateString()}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                        app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Chat with Client */}
                                <button
                                    onClick={() => openChat({
                                        issueId: app.issue?._id,
                                        devId: user._id, // Me (Dev)
                                        name: app.issue?.clientId?.name || "Client", // Target Name (Client)
                                        issueTitle: app.issue?.title
                                    })}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                    title="Chat with Client"
                                >
                                    <ExternalLink size={20} className="rotate-180" /> {/* Flip to indicate inwards/reply? Or just reuse icon */}
                                </button>

                                <Link to={`/issue/${app.issue?._id}`} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors">
                                    <ExternalLink size={20} />
                                </Link>
                                {app.status === 'ACCEPTED' && (
                                    <span className="text-green-600 font-bold text-sm flex items-center gap-1">
                                        <CheckCircle size={16} /> Hired
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DeveloperDashboard;
