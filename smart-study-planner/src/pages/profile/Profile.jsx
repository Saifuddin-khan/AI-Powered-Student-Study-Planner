import { useState, useEffect } from 'react';
import {
  FiEdit2, FiLock, FiUser, FiPhone,
  FiMail, FiCalendar, FiClock, FiShield,
  FiCheck, FiX, FiEye, FiEyeOff,
  FiBookOpen, FiCheckSquare, FiTarget, FiTrendingUp,
  FiAlertTriangle, FiCopy,
} from 'react-icons/fi';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import './Profile.css';

/* ─── Helpers ──────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return '—'; }
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return '—'; }
}

function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (/\d/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 10) score++;
  return score;
}

const STRENGTH_META = [
  { label: 'Enter a password', color: 'var(--border-soft, rgba(255,255,255,0.06))' },
  { label: 'Weak',   color: '#EF4444' },
  { label: 'Fair',   color: '#F59E0B' },
  { label: 'Good',   color: '#EAB308' },
  { label: 'Strong', color: '#22C55E' },
];

/* ─── Micro-components ─────────────────────────────────────── */
function Spinner({ size = 16 }) {
  return <span className="pf-spinner" style={{ width: size, height: size }} />;
}

function InfoRow({ icon, label, value, isLast }) {
  return (
    <div className={`info-row${isLast ? ' info-row--last' : ''}`}>
      <span className="info-icon">{icon}</span>
      <div>
        <div className="info-label">{label}</div>
        <div className={`info-value${!value ? ' info-value--empty' : ''}`}>
          {value || 'Not added'}
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div className="page-enter profile-page">
      <div className="pf-card">
        <div className="hero-banner pf-skeleton" />
        <div className="hero-body" style={{ paddingTop: 0 }}>
          <div className="avatar-upload-wrap">
            <div className="avatar-circle pf-skeleton" style={{ border: 'none' }} />
          </div>
          <div className="pf-skeleton" style={{ width: 190, height: 26, marginTop: 14, borderRadius: 6 }} />
          <div className="pf-skeleton" style={{ width: 250, height: 16, marginTop: 8, borderRadius: 6 }} />
          <div className="hero-stats" style={{ marginTop: 20 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="hero-stat">
                <div className="pf-skeleton" style={{ width: 48, height: 24, margin: '0 auto 6px', borderRadius: 4 }} />
                <div className="pf-skeleton" style={{ width: 72, height: 12, margin: '0 auto', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="profile-grid">
        <div className="pf-card pf-skeleton" style={{ minHeight: 360 }} />
        <div className="pf-card pf-skeleton" style={{ minHeight: 460 }} />
      </div>
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────── */
export default function Profile() {
  const { user, setUser } = useAuth();

  /* data */
  const [profile, setProfile]               = useState(null);
  const [stats, setStats]                   = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading]               = useState(true);

  /* ui */
  const [activeTab, setActiveTab]                 = useState('edit');
  const [editMode, setEditMode]                   = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading]         = useState(false);

  /* forms */
  const [editForm, setEditForm]   = useState({ name: '', phone: '', bio: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [pwForm, setPwForm]       = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [showPw, setShowPw]       = useState({ current: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  /* ── load ────────────────────────────────────────────────── */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [profileRes, statsRes, sessionsRes] = await Promise.allSettled([
          api.get('/users/me'),
          api.get('/dashboard/stats'),
          api.get('/pomodoro/history?limit=5'),
        ]);
        if (!mounted) return;
        if (profileRes.status === 'fulfilled') {
          const p = profileRes.value.data.data;
          setProfile(p);
          setEditForm({ name: p.name || '', phone: p.phone || '', bio: p.bio || '' });
        }
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
        if (sessionsRes.status === 'fulfilled')
          setRecentSessions(sessionsRes.value.data.data || []);
      } catch {
        toast.error('Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  /* ── handlers ────────────────────────────────────────────── */
  const cancelEdit = () => {
    setEditMode(false);
    setEditForm({ name: profile?.name || '', phone: profile?.phone || '', bio: profile?.bio || '' });
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) { toast.error('Name cannot be empty'); return; }
    try {
      setSaveLoading(true);
      const res = await api.put('/users/me', {
        name: editForm.name.trim(), phone: editForm.phone, bio: editForm.bio,
      });
      const updated = res.data.data;
      setProfile(p => ({ ...p, ...updated }));
      setUser(u => ({ ...u, ...updated }));
      setEditMode(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    try {
      setPwLoading(true);
      await api.post('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      setDeleteLoading(true);
      await api.delete('/users/me');
      toast.success('Account deleted');
      setTimeout(() => { window.location.href = '/'; }, 1200);
    } catch {
      toast.error('Failed to delete account');
      setDeleteLoading(false);
    }
  };

  /* ── derived ─────────────────────────────────────────────── */
  const displayName     = profile?.name || user?.name || 'Student';
  const profileImageUrl = profile?.profileImage || user?.profileImage;
  const strength        = getPasswordStrength(pwForm.newPassword);
  const strengthMeta    = STRENGTH_META[strength];
  const isAdmin         = (profile?.role || '').toUpperCase() === 'ADMIN';

  if (loading) return <ProfileSkeleton />;

  /* ── render ──────────────────────────────────────────────── */
  return (
    <div className="page-enter profile-page">

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO BANNER
      ══════════════════════════════════════════════════════ */}
      <div className="pf-card">
        <div className="hero-banner" />

        <div className="hero-body">
          {/* Absolute edit button */}
          <button
            className="hero-edit-btn"
            onClick={() => { setEditMode(true); setActiveTab('edit'); }}
          >
            <FiEdit2 size={14} /> Edit Profile
          </button>

          {/* Avatar */}
          <div className="avatar-upload-wrap">
            <div className="avatar-dashed-ring" />
            <div className="avatar-circle">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt={displayName} />
              ) : displayName ? (
                <span className="avatar-initial">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <FiUser size={48} color="#94A3B8" />
              )}
            </div>
          </div>

          {/* Name + role */}
          <div className="hero-name-row">
            <span className="hero-name">{displayName}</span>
            <span className={`role-badge${isAdmin ? ' role-badge--admin' : ' role-badge--user'}`}>
              {profile?.role || 'USER'}
            </span>
          </div>

          {/* Email row */}
          <div className="hero-sub-row">
            <FiMail size={14} />
            <span>{profile?.email || user?.email || ''}</span>
          </div>

          {/* Bio */}
          {profile?.bio && <p className="hero-bio">{profile.bio}</p>}

          {/* Stats */}
          <div className="hero-stats">
            <div className="hero-stat">
              <FiCheckSquare size={13} style={{ color: 'var(--primary, #7C6FCD)', marginBottom: 4 }} />
              <span className="hero-stat-value" style={{ color: 'var(--primary, #7C6FCD)' }}>
                {stats?.tasksToday ?? 0}
              </span>
              <span className="hero-stat-label">Tasks Today</span>
            </div>
            <div className="hero-stat">
              <FiBookOpen size={13} style={{ color: '#38BDF8', marginBottom: 4 }} />
              <span className="hero-stat-value" style={{ color: '#38BDF8' }}>
                {stats?.activeGoals ?? 0}
              </span>
              <span className="hero-stat-label">Active Goals</span>
            </div>
            <div className="hero-stat">
              <FiTarget size={13} style={{ color: '#F472B6', marginBottom: 4 }} />
              <span className="hero-stat-value" style={{ color: '#F472B6' }}>
                {stats?.completedThisMonth ?? 0}
              </span>
              <span className="hero-stat-label">Goals This Month</span>
            </div>
            <div className="hero-stat">
              <FiTrendingUp size={13} style={{ color: '#4ADE80', marginBottom: 4 }} />
              <span className="hero-stat-value" style={{ color: '#4ADE80' }}>
                {stats?.studyHoursWeek ?? 0}h
              </span>
              <span className="hero-stat-label">Hours This Week</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — TWO-COLUMN GRID
      ══════════════════════════════════════════════════════ */}
      <div className="profile-grid">

        {/* ── LEFT: Personal Info ─────────────────────────── */}
        <div className="pf-card info-card">
          <div className="info-card-header">
            <span className="info-card-title">
              {editMode ? 'Edit Profile' : 'Personal Information'}
            </span>
            <button
              className="icon-btn"
              onClick={editMode ? cancelEdit : () => setEditMode(true)}
              title={editMode ? 'Cancel' : 'Edit'}
            >
              {editMode ? <FiX size={16} /> : <FiEdit2 size={16} />}
            </button>
          </div>

          {editMode ? (
            <div className="edit-form">
              <div className="pf-field">
                <label className="pf-label">Full Name</label>
                <input
                  className="pf-input" type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div className="pf-field">
                <label className="pf-label">Phone</label>
                <input
                  className="pf-input" type="tel"
                  value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 9876543210"
                />
              </div>
              <div className="pf-field">
                <label className="pf-label">Bio</label>
                <textarea
                  className="pf-textarea" rows={3}
                  value={editForm.bio}
                  onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="pf-field">
                <label className="pf-label">Email</label>
                <input
                  className="pf-input" type="email"
                  value={profile?.email || user?.email || ''}
                  disabled
                />
                <p className="pf-hint">Email cannot be changed</p>
              </div>
              <button className="btn-primary-full" onClick={handleSaveProfile} disabled={saveLoading}>
                {saveLoading
                  ? <><Spinner size={15} /> Saving...</>
                  : <><FiCheck size={15} /> Save Changes</>}
              </button>
              <p className="pf-cancel-link" onClick={cancelEdit}>Cancel</p>
            </div>
          ) : (
            <>
              <InfoRow icon={<FiUser size={16} />}     label="Full Name"  value={displayName} />
              <InfoRow icon={<FiMail size={16} />}     label="Email"      value={profile?.email || user?.email} />
              <InfoRow icon={<FiPhone size={16} />}    label="Phone"      value={profile?.phone} />
              <InfoRow icon={<FiUser size={16} />}     label="Bio"        value={profile?.bio} />
              <InfoRow icon={<FiCalendar size={16} />} label="Joined"     value={formatDate(profile?.createdAt)} />
              <InfoRow icon={<FiClock size={16} />}    label="Last Login" value={formatDateTime(profile?.lastLoginAt)} isLast />
            </>
          )}
        </div>

        {/* ── RIGHT: Tabbed Panel ──────────────────────────── */}
        <div className="pf-card info-card">

          <div className="tab-bar">
            {[
              { key: 'edit',     label: 'Edit Profile', icon: <FiEdit2 size={13} /> },
              { key: 'password', label: 'Password',      icon: <FiLock size={13} /> },
              { key: 'account',  label: 'Account',       icon: <FiShield size={13} /> },
              { key: 'activity', label: 'Activity',      icon: <FiTrendingUp size={13} /> },
            ].map(tab => (
              <button
                key={tab.key}
                className={`tab-btn${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}<span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1 — Edit Profile */}
          {activeTab === 'edit' && (
            <div className="tab-content">
              <h3 className="tab-title">Update Your Profile</h3>
              <p className="tab-subtitle">Keep your information up to date</p>

              <div className="edit-grid">
                <div className="pf-field">
                  <label className="pf-label">Full Name</label>
                  <input
                    className="pf-input" type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="pf-field">
                  <label className="pf-label">Phone Number</label>
                  <input
                    className="pf-input" type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="pf-field pf-field--full">
                  <label className="pf-label">Bio</label>
                  <textarea
                    className="pf-textarea" rows={3}
                    value={editForm.bio}
                    onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              <button className="btn-primary-full" onClick={handleSaveProfile} disabled={saveLoading}>
                {saveLoading ? <><Spinner size={15} /> Saving...</> : 'Save Changes'}
              </button>
              <p className="pf-form-note">
                Changes will be reflected immediately across the app
              </p>
            </div>
          )}

          {/* TAB 2 — Change Password */}
          {activeTab === 'password' && (
            <div className="tab-content">
              <h3 className="tab-title">Change Password</h3>
              <p className="tab-subtitle">Use a strong password to keep your account secure</p>

              <div className="security-tips">
                {['✓ Min 8 characters', '✓ Include numbers', '✓ Use special chars'].map(t => (
                  <span key={t} className="security-chip">{t}</span>
                ))}
              </div>

              <div className="pf-field">
                <label className="pf-label">Current Password</label>
                <div className="pw-input-wrap">
                  <input
                    className="pf-input"
                    type={showPw.current ? 'text' : 'password'}
                    value={pwForm.currentPassword}
                    onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <button type="button" className="pw-toggle-btn"
                    onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}>
                    {showPw.current ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <div className="pf-field">
                <label className="pf-label">New Password</label>
                <div className="pw-input-wrap">
                  <input
                    className="pf-input"
                    type={showPw.new ? 'text' : 'password'}
                    value={pwForm.newPassword}
                    onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                  <button type="button" className="pw-toggle-btn"
                    onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}>
                    {showPw.new ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {pwForm.newPassword && (
                  <div className="pw-strength">
                    <div className="pw-strength-bar">
                      {[1, 2, 3, 4].map(seg => (
                        <div key={seg} className="pw-seg"
                          style={{ background: seg <= strength ? strengthMeta.color : undefined }} />
                      ))}
                    </div>
                    <span className="pw-strength-label" style={{ color: strengthMeta.color }}>
                      {strengthMeta.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="pf-field">
                <label className="pf-label">Confirm New Password</label>
                <div className="pw-input-wrap">
                  <input
                    className="pf-input"
                    type={showPw.confirm ? 'text' : 'password'}
                    value={pwForm.confirmPassword}
                    onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                  <button type="button" className="pw-toggle-btn"
                    onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}>
                    {showPw.confirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                  <p className="pw-mismatch"><FiX size={11} /> Passwords don't match</p>
                )}
              </div>

              <button
                className="btn-primary-full"
                onClick={handleChangePassword}
                disabled={
                  pwLoading || !pwForm.currentPassword || !pwForm.newPassword ||
                  pwForm.newPassword !== pwForm.confirmPassword
                }
              >
                {pwLoading ? <><Spinner size={15} /> Updating...</> : 'Update Password'}
              </button>
            </div>
          )}

          {/* TAB 3 — Account Info */}
          {activeTab === 'account' && (
            <div className="tab-content">
              <h3 className="tab-title">Account Details</h3>
              <p className="tab-subtitle">Read-only information about your account</p>

              <div className="account-row">
                <span className="account-row-label">Account Status</span>
                <span className="status-badge-active">
                  {profile?.isActive !== false ? '● Active' : '● Inactive'}
                </span>
              </div>
              <div className="account-row">
                <span className="account-row-label">Role</span>
                <span className={`role-badge${isAdmin ? ' role-badge--admin' : ' role-badge--user'}`}>
                  {profile?.role || 'USER'}
                </span>
              </div>
              <div className="account-row">
                <span className="account-row-label">Member Since</span>
                <span className="account-row-value">{formatDate(profile?.createdAt)}</span>
              </div>
              <div className="account-row">
                <span className="account-row-label">Last Login</span>
                <span className="account-row-value">{formatDateTime(profile?.lastLoginAt)}</span>
              </div>
              <div className="account-row account-row--col">
                <div className="account-row-inline">
                  <span className="account-row-label">Email Address</span>
                  <span className="account-row-value">{profile?.email || user?.email}</span>
                </div>
                <p className="account-email-note">Contact support to change email address</p>
              </div>
              <div className="account-row" style={{ borderBottom: 'none' }}>
                <span className="account-row-label">Account ID</span>
                <div className="account-id-row">
                  <span className="account-id-val">#{profile?.id || user?.id || '—'}</span>
                  <button
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(String(profile?.id || user?.id || ''));
                      toast.success('Copied to clipboard');
                    }}
                    title="Copy ID"
                  >
                    <FiCopy size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4 — Study Activity */}
          {activeTab === 'activity' && (
            <div className="tab-content">
              <h3 className="tab-title">Your Study Activity</h3>
              <p className="tab-subtitle">A summary of everything you've accomplished</p>

              <div className="activity-grid">
                <div className="activity-stat-card">
                  <FiCheckSquare size={24} color="#FB923C" />
                  <div>
                    <div className="activity-stat-val">{stats?.tasksToday ?? 0}</div>
                    <div className="activity-stat-lbl">Tasks Today</div>
                  </div>
                </div>
                <div className="activity-stat-card">
                  <FiBookOpen size={24} color="#38BDF8" />
                  <div>
                    <div className="activity-stat-val">{stats?.activeGoals ?? 0}</div>
                    <div className="activity-stat-lbl">Active Goals</div>
                  </div>
                </div>
                <div className="activity-stat-card">
                  <FiTarget size={24} color="#F472B6" />
                  <div>
                    <div className="activity-stat-val">{stats?.completedThisMonth ?? 0}</div>
                    <div className="activity-stat-lbl">Goals This Month</div>
                  </div>
                </div>
                <div className="activity-stat-card">
                  <FiTrendingUp size={24} color="#4ADE80" />
                  <div>
                    <div className="activity-stat-val">{stats?.studyHoursWeek ?? 0}h</div>
                    <div className="activity-stat-lbl">Hours This Week</div>
                  </div>
                </div>
              </div>

              <div className="streak-card">
                <div>
                  <div className="streak-emoji">🔥</div>
                  <div className="streak-title">Current Streak</div>
                  <div className="streak-sub">
                    {stats?.currentStreak ?? 0} consecutive study days
                  </div>
                </div>
                <div className="streak-right">
                  <div className="streak-num">{stats?.currentStreak ?? 0}</div>
                  <div className="streak-best">Best: {stats?.longestStreak ?? 0} days</div>
                </div>
              </div>

              <div className="activity-section-title">Recent Activity</div>

              {recentSessions.length === 0 ? (
                <p className="activity-empty">
                  No study activity recorded yet. Start studying! 📚
                </p>
              ) : (
                recentSessions.map((s, i) => (
                  <div key={i} className="activity-list-row">
                    <FiClock size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span>
                      Studied {s.subjectName || 'General'} for{' '}
                      {s.durationMinutes ?? '?'} min
                    </span>
                    <span className="activity-date">
                      {formatDate(s.startedAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — DANGER ZONE
      ══════════════════════════════════════════════════════ */}
      <div className="danger-card">
        <div className="danger-header">
          <FiAlertTriangle size={20} color="#F87171" />
          <span className="danger-title">Danger Zone</span>
        </div>
        <p className="danger-subtitle">
          These actions are permanent and cannot be undone. Please proceed carefully.
        </p>

        <div className="danger-action-row" style={{ borderBottom: 'none' }}>
          <div>
            <div className="danger-action-title" style={{ color: '#F87171' }}>
              Delete My Account
            </div>
            <div className="danger-action-sub">
              Permanently delete your account and all associated data
            </div>
          </div>
          <button
            className="btn-danger-outline"
            onClick={() => setShowDeleteConfirm(v => !v)}
          >
            Delete Account
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirm-box">
            <p className="delete-confirm-warn">
              ⚠️ Are you sure? Type <strong>DELETE</strong> to confirm
            </p>
            <input
              className="pf-input"
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              style={{ borderColor: 'rgba(248,113,113,0.4)' }}
            />
            <div className="delete-confirm-actions">
              <button
                className="btn-outline"
                style={{ flex: 1 }}
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
              >
                Cancel
              </button>
              <button
                className="btn-delete-confirm"
                style={{ flex: 1 }}
                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                onClick={handleDeleteAccount}
              >
                {deleteLoading ? <><Spinner size={14} /> Deleting...</> : 'Delete Permanently'}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
