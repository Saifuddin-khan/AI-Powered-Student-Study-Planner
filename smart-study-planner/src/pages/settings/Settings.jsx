import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdPalette, MdPerson, MdSecurity, MdStorage,
  MdInfo, MdChevronRight, MdLightMode, MdDarkMode,
  MdAutoAwesome, MdLogout,
} from 'react-icons/md';
import { toast } from 'react-toastify';

import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext }  from '../../context/AuthContext';
import authService           from '../../services/authService';
import aiService             from '../../services/aiService';
import { getRefreshToken }   from '../../utils/storage';
import PageHeader        from '../../components/common/PageHeader';
import './Settings.css';

/* ── Setting row ─────────────────────────────────────────── */
function SettingRow({ icon, label, description, control, onClick, danger }) {
  const isClickable = !!onClick;
  return (
    <div
      className={`setting-row${isClickable ? ' setting-row--clickable' : ''}${danger ? ' setting-row--danger' : ''}`}
      onClick={onClick}
    >
      <div className="setting-row__icon">{icon}</div>
      <div className="setting-row__body">
        <span className="setting-row__label">{label}</span>
        {description && <span className="setting-row__desc">{description}</span>}
      </div>
      {control && <div className="setting-row__control">{control}</div>}
      {isClickable && !control && <MdChevronRight size={20} className="setting-row__chevron" />}
    </div>
  );
}

/* ── Toggle switch ───────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <label className="settings-toggle" onClick={e => e.stopPropagation()}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="settings-toggle__track">
        <span className="settings-toggle__thumb" />
      </span>
    </label>
  );
}

/* ── Section card ────────────────────────────────────────── */
function Section({ title, icon, children }) {
  return (
    <div className="settings-section">
      <div className="settings-section__header">
        {icon}
        <h3 className="settings-section__title">{title}</h3>
      </div>
      <div className="settings-section__body">{children}</div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function Settings() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout }       = useContext(AuthContext);
  const navigate               = useNavigate();
  const [clearingAi, setClearingAi] = useState(false);

  const isDark = theme === 'dark';

  async function handleClearAi() {
    if (!window.confirm('Clear all AI chat history? This cannot be undone.')) return;
    setClearingAi(true);
    try {
      await aiService.clearHistory();
      toast.success('AI chat history cleared');
    } catch { toast.error('Failed to clear AI history'); }
    finally  { setClearingAi(false); }
  }

  async function handleLogout() {
    if (!window.confirm('Sign out of your account?')) return;
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) await authService.logout(refreshToken);
    } catch { /* silent */ }
    logout();
    navigate('/login');
  }

  return (
    <div className="page-enter settings-page">
      <PageHeader
        title="Settings"
        subtitle="Manage your preferences and account"
        accentColor="#94A3B8"
      />

      {/* ── Appearance ── */}
      <Section title="Appearance" icon={<MdPalette size={18} />}>
        <SettingRow
          icon={isDark ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
          label="Theme"
          description={isDark ? 'Dark mode is active' : 'Light mode is active'}
          control={
            <Toggle
              checked={isDark}
              onChange={toggleTheme}
            />
          }
        />
      </Section>

      {/* ── Account ── */}
      <Section title="Account" icon={<MdPerson size={18} />}>
        <div className="settings-profile-preview">
          <div className="settings-profile-preview__avatar">
            {user?.fullName?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className="settings-profile-preview__info">
            <span className="settings-profile-preview__name">{user?.fullName ?? '—'}</span>
            <span className="settings-profile-preview__email">{user?.email ?? '—'}</span>
          </div>
        </div>
        <SettingRow
          icon={<MdPerson size={20} />}
          label="Edit Profile"
          description="Update your name, bio, phone number"
          onClick={() => navigate('/profile')}
        />
        <SettingRow
          icon={<MdSecurity size={20} />}
          label="Change Password"
          description="Update your account password"
          onClick={() => navigate('/profile')}
        />
      </Section>

      {/* ── Data ── */}
      <Section title="Data & Privacy" icon={<MdStorage size={18} />}>
        <SettingRow
          icon={<MdAutoAwesome size={20} />}
          label="Clear AI Chat History"
          description="Delete all your AI assistant conversation history"
          onClick={clearingAi ? undefined : handleClearAi}
          control={clearingAi ? <span className="settings-loading">Clearing…</span> : null}
        />
      </Section>

      {/* ── About ── */}
      <Section title="About" icon={<MdInfo size={18} />}>
        <div className="settings-about">
          <div className="settings-about__row">
            <span className="settings-about__key">App</span>
            <span className="settings-about__val">Smart Study Planner</span>
          </div>
          <div className="settings-about__row">
            <span className="settings-about__key">Version</span>
            <span className="settings-about__val settings-about__val--mono">1.0.0</span>
          </div>
          <div className="settings-about__row">
            <span className="settings-about__key">Frontend</span>
            <span className="settings-about__val settings-about__val--mono">React 18 · CRA</span>
          </div>
          <div className="settings-about__row">
            <span className="settings-about__key">Backend</span>
            <span className="settings-about__val settings-about__val--mono">Spring Boot 3.3.6 · Java 21</span>
          </div>
          <div className="settings-about__row">
            <span className="settings-about__key">AI</span>
            <span className="settings-about__val settings-about__val--mono">OpenAI GPT-4o-mini</span>
          </div>
          <div className="settings-about__row">
            <span className="settings-about__key">Database</span>
            <span className="settings-about__val settings-about__val--mono">MySQL 8.0</span>
          </div>
        </div>
      </Section>

      {/* ── Logout ── */}
      <Section title="Session" icon={<MdLogout size={18} />}>
        <SettingRow
          icon={<MdLogout size={20} />}
          label="Sign Out"
          description="Sign out of your account on this device"
          onClick={handleLogout}
          danger
        />
      </Section>
    </div>
  );
}
