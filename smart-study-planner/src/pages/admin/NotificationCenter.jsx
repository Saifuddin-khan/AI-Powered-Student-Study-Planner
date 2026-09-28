import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const TYPES = ['ANNOUNCEMENT', 'REMINDER', 'ALERT', 'INFO'];

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  const [form, setForm] = useState({ title: '', message: '', type: 'ANNOUNCEMENT', isGlobal: true });
  const [sending, setSending] = useState(false);

  const [deliveryId, setDeliveryId]     = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);

  const fetchNotifications = () => {
    setLoading(true);
    adminService.getNotifications(0, 20)
      .then(res => setNotifications(res.data.data?.content || []))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.warn('Title and message are required'); return;
    }
    setSending(true);
    try {
      const created = await adminService.createNotification(form.title, form.message, form.type, form.isGlobal);
      const notifId = created.data.data?.id;
      if (notifId) {
        await adminService.sendNotification(notifId);
        toast.success('Notification sent to all users!');
      }
      setForm({ title: '', message: '', type: 'ANNOUNCEMENT', isGlobal: true });
      fetchNotifications();
    } catch { toast.error('Failed to send notification'); }
    finally { setSending(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await adminService.deleteNotification(id);
      toast.success('Deleted');
      fetchNotifications();
    } catch { toast.error('Failed to delete'); }
  };

  const handleDeliveryStatus = async (id) => {
    try {
      const res = await adminService.getDeliveryStatus(id);
      setDeliveryId(id);
      setDeliveryData(res.data.data);
    } catch { toast.error('Failed to fetch delivery status'); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Notification Center</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>

        {/* Create & Send */}
        <div className="admin-card">
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Create & Send Notification</h3>

          <input
            type="text" className="admin-input" placeholder="Title"
            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            style={{ width: '100%', marginBottom: 10 }}
          />
          <textarea
            className="admin-input" placeholder="Message"
            value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            style={{ width: '100%', minHeight: 90, marginBottom: 10 }}
          />
          <select
            className="admin-input"
            value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            style={{ width: '100%', marginBottom: 10 }}
          >
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isGlobal}
              onChange={e => setForm(f => ({ ...f, isGlobal: e.target.checked }))} />
            <span>Broadcast to ALL users</span>
          </label>
          <button className="admin-btn admin-btn-primary" style={{ width: '100%' }}
            onClick={handleSend} disabled={sending}>
            {sending ? 'Sending…' : '📢 Send Notification'}
          </button>
        </div>

        {/* Recent list */}
        <div className="admin-card">
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Recent Notifications</h3>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
          ) : notifications.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No notifications yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notifications.map(n => (
                <div key={n.id} style={{ borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, marginRight: 8 }}>
                      <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{n.title}</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', margin: '2px 0' }}>{n.message}</p>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {n.type} · {n.sentAt ? '✅ Sent' : '⏳ Pending'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="admin-btn admin-btn-sm"
                        onClick={() => handleDeliveryStatus(n.id)}>Stats</button>
                      <button className="admin-btn admin-btn-sm admin-btn-danger"
                        onClick={() => handleDelete(n.id)}>Del</button>
                    </div>
                  </div>
                  {deliveryId === n.id && deliveryData && (
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', marginTop: 6, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      Delivered: <strong style={{ color: 'var(--accent-green)' }}>{deliveryData.deliveredCount}</strong> · Read: <strong style={{ color: 'var(--accent-blue)' }}>{deliveryData.readCount}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
