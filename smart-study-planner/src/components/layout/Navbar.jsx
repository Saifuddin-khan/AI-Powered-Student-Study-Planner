import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MdMenu, MdLightMode, MdDarkMode, MdNotifications, MdPerson,
  MdSettings, MdLogout,
} from 'react-icons/md';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import useClickOutside from '../../hooks/useClickOutside';
import Avatar from '../ui/Avatar/Avatar';
import authService from '../../services/authService';
import { getRefreshToken } from '../../utils/storage';
import { toast } from 'react-toastify';
import './Navbar.css';

const ROUTE_TITLES = {
  '/dashboard':     'Dashboard',
  '/profile':       'My Profile',
  '/subjects':      'Subjects',
  '/tasks':         'Tasks',
  '/notes':         'Notes',
  '/goals':         'Goals',
  '/planner':       'Study Planner',
  '/timetable':     'Timetable',
  '/progress':      'Progress',
  '/pomodoro':      'Pomodoro Timer',
  '/analytics':     'Analytics',
  '/ai':            'AI Assistant',
  '/notifications': 'Notifications',
  '/settings':      'Settings',
  '/admin/dashboard':     'Admin Dashboard',
  '/admin/users':         'User Management',
  '/admin/notifications': 'Notification Center',
  '/admin/analytics':     'Platform Analytics',
  '/admin/settings':      'System Settings',
};

function Navbar({ collapsed, onMobileOpen, unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setDropdownOpen(false));

  const pageTitle = ROUTE_TITLES[location.pathname] || 'Smart Study Planner';

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) await authService.logout(refreshToken);
    } catch {}
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <header className={`navbar${collapsed ? ' navbar--collapsed' : ''}`}>
      <div className="navbar__left">
        <button
          className="navbar__hamburger hide-desktop"
          onClick={onMobileOpen}
          aria-label="Open menu"
        >
          <MdMenu size={20} />
        </button>
        <h1 className="navbar__title">{pageTitle}</h1>
      </div>

      <div className="navbar__right">
        {/* Theme toggle */}
        <button className="navbar__action" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>

        {/* Notifications */}
        <button
          className="navbar__action"
          onClick={() => navigate('/notifications')}
          title="Notifications"
        >
          <MdNotifications size={20} />
          {unreadCount > 0 && (
            <span className="navbar__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {/* Avatar / User dropdown */}
        <div className="navbar__avatar-wrap" ref={dropdownRef}>
          <button
            className="navbar__avatar-btn"
            onClick={() => setDropdownOpen(v => !v)}
          >
            <Avatar name={user?.name} size="sm" />
            <span className="navbar__user-name hide-mobile">{user?.name}</span>
          </button>

          {dropdownOpen && (
            <div className="navbar__dropdown">
              <button
                className="navbar__dropdown-item"
                onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
              >
                <MdPerson size={16} /> Profile
              </button>
              <button
                className="navbar__dropdown-item"
                onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
              >
                <MdSettings size={16} /> Settings
              </button>
              <div className="navbar__dropdown-divider" />
              <button
                className="navbar__dropdown-item navbar__dropdown-item--danger"
                onClick={handleLogout}
              >
                <MdLogout size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
