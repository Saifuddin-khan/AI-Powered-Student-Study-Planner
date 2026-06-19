import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { getStoredUser } from '../../utils/storage';
import adminService from '../../services/adminService';

const Security = () => {
  const currentUser           = getStoredUser();
  const [targetId, setTargetId] = useState('');
  const [impersonating, setImpersonating] = useState(false);
  const [sessionToken, setSessionToken]   = useState(null);

  const handleStartImpersonation = async () => {
    const id = parseInt(targetId, 10);
    if (!id) { toast.warn('Enter a valid User ID'); return; }
    if (id === currentUser?.id) { toast.warn('Cannot impersonate yourself'); return; }
    setImpersonating(true);
    try {
      const res   = await adminService.startImpersonation(id);
      const token = res.data.data;
      setSessionToken(token);
      toast.success('Impersonation session started. Navigate to /dashboard to view as this user.');
    } catch { toast.error('Failed to start impersonation'); }
    finally { setImpersonating(false); }
  };

  const handleExitImpersonation = async () => {
    if (!sessionToken) return;
    try {
      await adminService.exitImpersonation(sessionToken);
      setSessionToken(null);
      setTargetId('');
      toast.success('Impersonation session ended');
    } catch { toast.error('Failed to end impersonation'); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Security</h2>
      </div>

      {/* Impersonation */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 12 }}>User Impersonation</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
          Log in as another user to debug or support them. Enter their User ID below.
        </p>

        {!sessionToken ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="admin-input"
              type="number"
              placeholder="User ID"
              value={targetId}
              onChange={e => setTargetId(e.target.value)}
              style={{ width: 160 }}
            />
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleStartImpersonation}
              disabled={impersonating}
            >
              {impersonating ? 'Starting…' : 'Start Impersonation'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ background: 'rgba(251, 146, 60, 0.12)', border: '1px solid rgba(251, 146, 60, 0.4)', borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 12 }}>
              <strong style={{ color: 'var(--accent-orange)' }}>⚠️ Active Impersonation Session</strong>
              <p style={{ fontSize: 'var(--text-xs)', margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                Session token: <code style={{ color: 'var(--accent-orange)' }}>{sessionToken.substring(0, 20)}…</code>
              </p>
            </div>
            <button className="admin-btn admin-btn-danger" onClick={handleExitImpersonation}>
              Exit Impersonation
            </button>
          </div>
        )}
      </div>

      {/* Current Admin Info */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Current Admin Session</h3>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div><strong style={{ color: 'var(--text-primary)' }}>Name:</strong> {currentUser?.name || '—'}</div>
          <div><strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {currentUser?.email || '—'}</div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Role:</strong>{' '}
            <span className="admin-badge admin">ADMIN</span>
          </div>
        </div>
      </div>

      {/* Audit Note */}
      <div className="admin-card">
        <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Audit Log</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          All admin actions (user creation, role changes, password resets, deletions) are automatically
          logged to the database via the <code style={{ color: 'var(--primary-light)' }}>ActivityLog</code> table.
          Use your database client or the Reports section to query audit history.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-3)' }}>
          Table: <code style={{ color: 'var(--primary-light)' }}>activity_logs</code> · Retention: 90 days
        </p>
      </div>
    </div>
  );
};

export default Security;
