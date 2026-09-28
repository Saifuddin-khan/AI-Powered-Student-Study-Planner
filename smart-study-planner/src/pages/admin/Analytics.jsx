import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const StatRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-soft)' }}>
    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{label}</span>
    <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{value ?? '—'}</strong>
  </div>
);

const AnalyticsCard = ({ title, data, loading }) => (
  <div className="admin-card">
    <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>{title}</h3>
    {loading ? (
      <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
    ) : !data ? (
      <p style={{ color: 'var(--text-muted)' }}>No data</p>
    ) : (
      Object.entries(data).map(([k, v]) => (
        <StatRow key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} value={String(v)} />
      ))
    )}
  </div>
);

const Analytics = () => {
  const [users,     setUsers]     = useState(null);
  const [tasks,     setTasks]     = useState(null);
  const [subjects,  setSubjects]  = useState(null);
  const [pomodoro,  setPomodoro]  = useState(null);
  const [notifs,    setNotifs]    = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getUserAnalytics(),
      adminService.getTaskAnalytics(),
      adminService.getSubjectAnalytics(),
      adminService.getPomodoroAnalytics(),
      adminService.getNotifAnalytics(),
    ])
      .then(([u, t, s, p, n]) => {
        setUsers(u.data.data);
        setTasks(t.data.data);
        setSubjects(s.data.data);
        setPomodoro(p.data.data);
        setNotifs(n.data.data);
      })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Platform Analytics</h2>
      </div>
      <div className="admin-stats-grid">
        <AnalyticsCard title="👥 User Analytics"         data={users}    loading={loading} />
        <AnalyticsCard title="📋 Task Analytics"         data={tasks}    loading={loading} />
        <AnalyticsCard title="📚 Subject Analytics"      data={subjects} loading={loading} />
        <AnalyticsCard title="🍅 Pomodoro Analytics"     data={pomodoro} loading={loading} />
        <AnalyticsCard title="🔔 Notification Analytics" data={notifs}   loading={loading} />
      </div>
    </div>
  );
};

export default Analytics;
