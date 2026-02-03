import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import IssueList from "./pages/Marketplace/IssueList";
import IssueDetail from "./pages/Marketplace/IssueDetail";
import CreateIssue from "./pages/Marketplace/CreateIssue";
import ClientDashboard from "./pages/Dashboard/ClientDashboard";
import DeveloperDashboard from "./pages/Dashboard/DeveloperDashboard";
import Profile from "./pages/Profile/Profile";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Analytics from "./pages/Analytics/Analytics";
import MyPosts from "./pages/Dashboard/MyPosts";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              {/* Public Routes */}
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route index element={<IssueList />} />
                <Route path="client-dashboard" element={<ClientDashboard />} />
                <Route path="applications" element={<DeveloperDashboard />} />
                <Route path="issue/:id" element={<IssueDetail />} />
                <Route path="post-job" element={<CreateIssue />} />
                <Route path="profile" element={<Profile />} />
                <Route path="my-posts" element={<MyPosts />} />
              </Route>

              <Route path="*" element={<div className="text-center py-20">Page Not Found</div>} />
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
          </Routes>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
