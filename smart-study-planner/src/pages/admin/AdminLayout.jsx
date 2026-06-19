import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { clearAuth } from '../../utils/storage';
import './AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <button className="admin-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            ☰
          </button>
          <h1 className="admin-title">🎓 Admin Panel</h1>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {/* Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
