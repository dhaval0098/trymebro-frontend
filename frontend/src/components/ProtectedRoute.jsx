import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const { user, token, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#d4af37',
        fontSize: '1.1rem'
      }}>
        <div className="gold-shimmer" style={{ padding: '20px 40px', borderRadius: '12px' }}>
          Loading TRY ME BRO Parfumerie...
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} state={{ from: location }} replace />;
  }

  // Admin route requested by a non-admin (Customer)
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Customer route requested by an Admin
  if ((userOnly || !adminOnly) && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
