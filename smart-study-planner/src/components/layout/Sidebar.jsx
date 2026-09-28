import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdPerson, MdMenuBook, MdCheckCircle, MdStickyNote2,
  MdFlag, MdGridView, MdShowChart, MdTimer, MdEditCalendar,
  MdBarChart, MdSmartToy, MdNotifications, MdSettings,
  MdAdminPanelSettings, MdLogout, MdChevronLeft, MdChevronRight,
  MdPeople,
} from 'react-icons/md';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import { getRefreshToken } from '../../utils/storage';
import './Sidebar.css';

/* ── User nav groups ───────────────────────────────────── */
const USER_NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
      { to: '/profile',   icon: <MdPerson />,    label: 'Profile'   },
    ],
  },
  {
    label: 'Study',
    items: [
      { to: '/subjects',  icon: <MdMenuBook />,    label: 'Subjects'  },
      { to: '/tasks',     icon: <MdCheckCircle />, label: 'Tasks'     },
      { to: '/notes',     icon: <MdStickyNote2 />, label: 'Notes'     },
      { to: '/goals',     icon: <MdFlag />,        label: 'Goals'     },
      { to: '/timetable', icon: <MdGridView />,      label: 'Timetable' },
      { to: '/planner',   icon: <MdEditCalendar />, label: 'Planner'   },
    ],
  },
  {
    label: 'Track',
    items: [
      { to: '/progress', icon: <MdShowChart />, label: 'Progress' },
      { to: '/pomodoro', icon: <MdTimer />,     label: 'Pomodoro' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/analytics', icon: <MdBarChart />, label: 'Analytics'    },
      { to: '/ai',        icon: <MdSmartToy />, label: 'AI Assistant' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/notifications', icon: <MdNotifications />, label: 'Notifications' },
      { to: '/settings',      icon: <MdSettings />,      label: 'Settings'      },
    ],
  },
];

/* ── Admin nav groups ──────────────────────────────────── */
const ADMIN_NAV_GROUPS = [
  {
    label: 'Platform',
    items: [
      { to: '/admin/dashboard',     icon: <MdDashboard />,        label: 'Dashboard'       },
      { to: '/admin/users',         icon: <MdPeople />,           label: 'User Management' },
      { to: '/admin/notifications', icon: <MdNotifications />,    label: 'Notifications'   },
      { to: '/admin/analytics',     icon: <MdBarChart />,      label: 'Analytics' },
      { to: '/admin/settings',      icon: <MdSettings />,      label: 'Settings'   },
    ],
  },
  {
    label: 'Study',
    items: [
      { to: '/subjects',  icon: <MdMenuBook />,    label: 'Subjects'  },
      { to: '/tasks',     icon: <MdCheckCircle />, label: 'Tasks'     },
      { to: '/notes',     icon: <MdStickyNote2 />, label: 'Notes'     },
      { to: '/goals',     icon: <MdFlag />,        label: 'Goals'     },
      { to: '/timetable', icon: <MdGridView />,      label: 'Timetable' },
      { to: '/planner',   icon: <MdEditCalendar />, label: 'Planner'   },
    ],
  },
  {
    label: 'Track',
    items: [
      { to: '/pomodoro', icon: <MdTimer />, label: 'Pomodoro' },
    ],
  },
  {
    label: 'AI',
    items: [
      { to: '/ai', icon: <MdSmartToy />, label: 'AI Assistant' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile',       icon: <MdPerson />,        label: 'My Profile'    },
      { to: '/notifications', icon: <MdNotifications />, label: 'Notifications' },
    ],
  },
];

function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin   = user?.role === 'ADMIN';
  const navGroups = isAdmin ? ADMIN_NAV_GROUPS : USER_NAV_GROUPS;

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
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onMobileClose} />}

      <nav className={[
        'sidebar',
        collapsed ? 'sidebar--collapsed' : '',
        mobileOpen ? 'sidebar--mobile-open' : '',
      ].filter(Boolean).join(' ')}>

        {/* Toggle */}
        <button
          className="sidebar__toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <MdChevronRight size={16} /> : <MdChevronLeft size={16} />}
        </button>

        {/* Logo */}
        <div className="sidebar__logo">
          <img
            src="/studeaid-logo-removebg-preview.png"
            alt="STUDEAID"
            className="sidebar__logo-icon"
            style={{ objectFit: 'contain' }}
          />
          <span className="sidebar__logo-text">STUDEAID</span>
        </div>

        {/* Admin role badge */}
        {isAdmin && !collapsed && (
          <div className="sidebar__admin-badge">
            <MdAdminPanelSettings size={13} />
            <span>Admin Panel</span>
          </div>
        )}

        {/* Nav groups */}
        <div className="sidebar__nav">
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="sidebar__group-label">{group.label}</div>
              <div className="sidebar__items">
                {group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      'sidebar__item' + (isActive ? ' sidebar__item--active' : '')
                    }
                    onClick={onMobileClose}
                    title={collapsed ? item.label : ''}
                  >
                    <span className="sidebar__item-icon">{item.icon}</span>
                    <span className="sidebar__item-label">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="sidebar__footer">
          <button
            className="sidebar__item"
            style={{ width: '100%', background: 'none', border: 'none' }}
            onClick={handleLogout}
            title={collapsed ? 'Logout' : ''}
          >
            <span className="sidebar__item-icon"><MdLogout /></span>
            <span className="sidebar__item-label">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export default Sidebar;
