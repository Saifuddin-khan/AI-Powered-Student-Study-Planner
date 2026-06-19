import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const SETTINGS_KEYS = [
  { key: 'app.name',         label: 'App Name',         type: 'text',     default: 'Smart Study Planner' },
  { key: 'maintenance.mode', label: 'Maintenance Mode',  type: 'boolean',  default: 'false' },
  { key: 'max.users',        label: 'Max Users',         type: 'text',     default: '' },
];

const Settings = () => {
  const [values,  setValues]  = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    const fetches = SETTINGS_KEYS.map(s =>
      adminService.getSetting(s.key)
        .then(res => ({ key: s.key, value: res.data.data ?? s.default }))
        .catch(() => ({ key: s.key, value: s.default }))
    );
    Promise.all(fetches)
      .then(results => {
        const map = {};
        results.forEach(r => { map[r.key] = r.value; });
        setValues(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(values).map(([key, value]) =>
          adminService.updateSetting(key, String(value))
        )
      );
      toast.success('Settings saved');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const update = (key, value) => setValues(v => ({ ...v, [key]: value }));

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">System Settings</h2>
      </div>

      <div className="admin-card">
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading settings…</p>
        ) : (
          <>
            {SETTINGS_KEYS.map(s => (
              <div key={s.key} style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-primary)' }}>{s.label}</label>
                {s.type === 'boolean' ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={values[s.key] === 'true'}
                      onChange={e => update(s.key, String(e.target.checked))}
                    />
                    <span>{values[s.key] === 'true' ? 'Enabled' : 'Disabled'}</span>
                  </label>
                ) : (
                  <input
                    className="admin-input"
                    type="text"
                    value={values[s.key] ?? ''}
                    onChange={e => update(s.key, e.target.value)}
                    style={{ width: '100%', maxWidth: 400 }}
                  />
                )}
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>Key: {s.key}</p>
              </div>
            ))}
            <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Settings;
