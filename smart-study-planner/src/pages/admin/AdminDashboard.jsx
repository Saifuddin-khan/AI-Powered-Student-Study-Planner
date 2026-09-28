import React, { useState, useEffect } from 'react';
import {
  MdPeople, MdCheckCircle, MdBlock, MdPersonAdd,
  MdCampaign, MdArrowForward, MdVisibility,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import adminService from '../../services/adminService';
import StatCard from '../../components/common/StatCard';

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

const QuickLink = ({ icon, label, desc, to, accent }) => {
  const navigate = useNavigate();
  return (
    <button
      className="adm-quick-link"
      style={{ '--ql-accent': accent }}
      onClick={() => navigate(to)}
    >
      <span className="adm-quick-link__icon">{icon}</span>
      <span className="adm-quick-link__text">
        <span className="adm-quick-link__label">{label}</span>
        <span className="adm-quick-link__desc">{desc}</span>
      </span>
      <MdArrowForward size={16} className="adm-quick-link__arrow" />
    </button>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    adminService.getDashboardStats()
      .then(res => setStats(res.data.data))
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="adm-dashboard">

      {/* ── Welcome banner ─────────────────────────────── */}
      <div className="adm-welcome">
        <div className="adm-welcome__body">
          <p className="adm-welcome__date">{formatDate()}</p>
          <h1 className="adm-welcome__title">
            Welcome back, {user?.name?.split(' ')[0] ?? 'Admin'}
          </h1>
          <p className="adm-welcome__sub">
            Here's what's happening on your platform today.
          </p>
        </div>
        <div className="adm-welcome__glow" aria-hidden="true" />
      </div>

      {/* ── Stat cards ─────────────────────────────────── */}
      {loading && (
        <div className="adm-skeleton-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="adm-skeleton" />)}
        </div>
      )}
      {error && (
        <p style={{ color: 'var(--accent-red)', marginBottom: 'var(--space-6)' }}>{error}</p>
      )}
      {stats && (
        <div className="admin-stats-grid">
          <StatCard
            icon={<MdPeople size={22} />}
            value={stats.totalUsers}
            label="Total Users"
            accent="var(--primary)"
          />
          <StatCard
            icon={<MdCheckCircle size={22} />}
            value={stats.activeUsers}
            label="Active Users"
            accent="var(--accent-green)"
          />
          <StatCard
            icon={<MdBlock size={22} />}
            value={stats.disabledUsers}
            label="Disabled Users"
            accent="var(--accent-red)"
          />
          <StatCard
            icon={<MdPersonAdd size={22} />}
            value={stats.newRegistrations}
            label="New Yesterday"
            accent="var(--accent-orange)"
          />
          <StatCard
            icon={<MdCampaign size={22} />}
            value={stats.notificationsSent}
            label="Notifications Sent"
            accent="var(--accent-blue)"
          />
          <StatCard
            icon={<MdVisibility size={22} />}
            value={stats.notificationsRead}
            label="Notifications Read"
            accent="var(--accent-analytics)"
          />
        </div>
      )}

      {/* ── Quick links ────────────────────────────────── */}
      <h2 className="adm-section-title">Quick Actions</h2>
      <div className="adm-quick-grid">
        <QuickLink
          icon={<MdPeople size={20} />}
          label="Manage Users"
          desc="View, edit, disable or delete accounts"
          to="/admin/users"
          accent="var(--primary)"
        />
        <QuickLink
          icon={<MdCampaign size={20} />}
          label="Send Notification"
          desc="Broadcast a message to all users"
          to="/admin/notifications"
          accent="var(--accent-blue)"
        />
        <QuickLink
          icon={<MdCheckCircle size={20} />}
          label="Analytics"
          desc="Platform usage stats & insights"
          to="/admin/analytics"
          accent="var(--accent-green)"
        />
      </div>

    </div>
  );
};

export default AdminDashboard;
