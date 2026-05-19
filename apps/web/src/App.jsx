import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@app/context/AuthContext";
import { WalletProvider } from "@app/context/WalletContext";
import { ChatProvider } from "@app/context/ChatContext";
import { ToastProvider } from "@app/context/ToastContext";
import MainLayout from "@app/layouts/MainLayout";
import Login from "@pages/Auth/Login";
import Signup from "@pages/Auth/Signup";
import ProtectedRoute from "@app/routes/ProtectedRoute";
import IssueList from "@pages/Marketplace/IssueList";
import IssueDetail from "@pages/Marketplace/IssueDetail";
import CreateIssue from "@pages/Marketplace/CreateIssue";
import Dashboard from "@pages/Dashboard/Dashboard";
import Profile from "@pages/Profile/Profile";
import AdminLogin from "@pages/Admin/AdminLogin";
import AdminDashboard from "@pages/Admin/AdminDashboard";
import Analytics from "@pages/Analytics/Analytics";
import NotFound from "@pages/NotFound";
import ProtectedAdminRoute from "@app/routes/ProtectedAdminRoute";
import WorkspacePage from "@pages/Workspace/WorkspacePage";
import GitHubConnect from "@pages/Workspace/GitHubConnect";
import KycVerification from "@pages/Kyc/KycVerification";
import KycMobileLiveness from "@pages/Kyc/KycMobileLiveness";

function App() {
    return (
        <AuthProvider>
            <WalletProvider>
                <ToastProvider>
                    <ChatProvider>
                        <Router>
                            <Routes>
                                <Route path="/" element={<MainLayout />}>
                                    {/* Public Routes */}
                                    <Route path="login" element={<Login />} />
                                    <Route path="signup" element={<Signup />} />
                                    <Route index element={<IssueList />} />
                                    <Route path="issue/:id" element={<IssueDetail />} />

                                    {/* Protected Routes */}
                                    <Route element={<ProtectedRoute />}>
                                        <Route path="dashboard" element={<Dashboard />} />
                                        <Route path="client-dashboard" element={<Dashboard />} />
                                        <Route path="my-posts" element={<Dashboard />} />
                                        <Route path="applications" element={<Dashboard />} />
                                        <Route path="post-job" element={<CreateIssue />} />
                                        <Route path="profile" element={<Profile />} />
                                        <Route path="github/connect" element={<GitHubConnect />} />
                                        <Route path="kyc" element={<KycVerification />} />
                                    </Route>

                                    <Route path="*" element={<NotFound />} />
                                </Route>

                                {/* Admin Routes - Outside Main Layout */}
                                <Route path="/admin/login" element={<AdminLogin />} />
                                <Route path="/admin/dashboard" element={
                                    <ProtectedAdminRoute>
                                        <AdminDashboard />
                                    </ProtectedAdminRoute>
                                } />
                                <Route path="/admin/analytics" element={
                                    <ProtectedAdminRoute>
                                        <Analytics />
                                    </ProtectedAdminRoute>
                                } />

                                {/* Workspace — full-screen, outside MainLayout */}
                                <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />

                                {/* eKYC Mobile Scanner View */}
                                <Route path="/ekyc/session/:sessionId" element={<KycMobileLiveness />} />
                            </Routes>
                        </Router>
                    </ChatProvider>
                </ToastProvider>
            </WalletProvider>
        </AuthProvider>
    );
}

export default App;
