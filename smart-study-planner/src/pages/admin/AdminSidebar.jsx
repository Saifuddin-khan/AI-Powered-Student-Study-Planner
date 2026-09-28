import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Content', path: '/admin/content' },
    { label: 'Notifications', path: '/admin/notifications' },
    { label: 'Analytics', path: '/admin/analytics' },
    { label: 'Reports', path: '/admin/reports' },
    { label: 'Settings', path: '/admin/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h2>ADMIN MENU</h2>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <p>© 2026 Smart Study Planner</p>
        </div>
      </aside>

      {mobileOpen && <div className="admin-overlay" onClick={() => setMobileOpen(false)} />}
    </>
  );
};

export default AdminSidebar;
