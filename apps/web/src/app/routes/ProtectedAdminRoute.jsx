import React from 'react';
import { Navigate } from 'react-router-dom';

// Checks for a valid admin JWT token in localStorage (set by server-side admin login)
// The actual role verification happens on the server — this is just a frontend guard
const ProtectedAdminRoute = ({ children }) => {
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');

    // Must have token AND confirmed ADMIN role from server response
    if (!adminToken || !adminUser || adminUser.role !== 'ADMIN') {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default ProtectedAdminRoute;
