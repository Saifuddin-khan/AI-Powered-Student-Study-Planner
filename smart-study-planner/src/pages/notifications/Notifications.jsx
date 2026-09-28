import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MdCheckCircle, MdFlag, MdInfo, MdCampaign,
  MdDelete, MdDoneAll, MdNotifications, MdMarkEmailUnread, MdMarkEmailRead,
} from 'react-icons/md';
import { toast } from 'react-toastify';

import notificationService from '../../services/notificationService';
import PageHeader           from '../../components/common/PageHeader';
import EmptyState           from '../../components/ui/EmptyState/EmptyState';
import { SkeletonList }     from '../../components/ui/Skeleton/Skeleton';
import ConfirmDialog        from '../../components/ui/ConfirmDialog/ConfirmDialog';
import './Notifications.css';

/* ── Type metadata ───────────────────────────────────────── */
const TYPE_META = {
  TASK:         { icon: <MdCheckCircle size={18} />, color: '#38BDF8', label: 'Task'         },
  GOAL:         { icon: <MdFlag        size={18} />, color: '#F472B6', label: 'Goal'         },
  SYSTEM:       { icon: <MdInfo        size={18} />, color: '#7C6FCD', label: 'System'       },
  ANNOUNCEMENT: { icon: <MdCampaign   size={18} />, color: '#F59E0B', label: 'Announcement' },
};

function fallbackMeta(type) {
  return TYPE_META[type] ?? { icon: <MdInfo size={18} />, color: '#94A3B8', label: type };
}

/* ── Time ago ─────────────────────────────────────────────── */
function timeAgo(dt) {
  if (!dt) return '';
  const diff = Math.floor((Date.now() - new Date(dt)) / 1000);
  if (diff < 60)     return 'just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ── Single notification item ─────────────────────────────── */
function NotifItem({ notif, onRead, onUnread, onDelete }) {
  const meta = fallbackMeta(notif.type);

  function handleClick() {
    if (!notif.isRead) onRead(notif.id);
  }

  return (
    <div
      className={`notif-item${notif.isRead ? '' : ' notif-item--unread'}`}
      style={{ '--notif-color': meta.color }}
      onClick={handleClick}
    >
      {/* Unread dot */}
      {!notif.isRead && <span className="notif-item__dot" />}

      {/* Type icon */}
      <div className="notif-item__icon">{meta.icon}</div>

      {/* Content */}
      <div className="notif-item__content">
        <div className="notif-item__header">
          <span className="notif-item__title">{notif.title}</span>
          <span className="notif-item__type-badge" style={{ color: meta.color, borderColor: meta.color }}>
            {meta.label}
          </span>
        </div>
        {notif.message && <p className="notif-item__message">{notif.message}</p>}
        <span className="notif-item__time">{timeAgo(notif.createdAt)}</span>
      </div>

      {/* Actions */}
      <div className="notif-item__actions" onClick={e => e.stopPropagation()}>
        {notif.isRead ? (
          <button className="notif-item__action-btn" onClick={() => onUnread(notif.id)} title="Mark as unread">
            <MdMarkEmailUnread size={15} />
          </button>
        ) : (
          <button className="notif-item__action-btn" onClick={() => onRead(notif.id)} title="Mark as read">
            <MdMarkEmailRead size={15} />
          </button>
        )}
        <button className="notif-item__del" onClick={() => onDelete(notif)} title="Delete">
          <MdDelete size={16} />
        </button>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState('ALL');
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [markingAll,    setMarkingAll]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data?.data?.content ?? []);
    } catch { toast.error('Failed to load notifications'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRead = useCallback(async (id) => {
    try {
      const res = await notificationService.markAsRead(id);
      const updated = res.data?.data;
      setNotifications(prev =>
        prev.map(n => n.id === id ? (updated ?? { ...n, isRead: true }) : n)
      );
    } catch { toast.error('Failed to mark as read'); }
  }, []);

  const handleUnread = useCallback(async (id) => {
    try {
      const res = await notificationService.markAsUnread(id);
      const updated = res.data?.data;
      setNotifications(prev =>
        prev.map(n => n.id === id ? (updated ?? { ...n, isRead: false }) : n)
      );
    } catch { toast.error('Failed to mark as unread'); }
  }, []);

  const handleMarkAll = useCallback(async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to mark all as read'); }
    finally  { setMarkingAll(false); }
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    try {
      await notificationService.delete(deleteTarget.id);
      setNotifications(prev => prev.filter(n => n.id !== deleteTarget.id));
      toast.success('Notification deleted');
      setDeleteTarget(null);
    } catch { toast.error('Failed to delete'); }
    finally  { setDeleting(false); }
  }, [deleteTarget]);

  const filtered = useMemo(() =>
    filter === 'UNREAD' ? notifications.filter(n => !n.isRead) : notifications,
  [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const hasUnread   = unreadCount > 0;

  return (
    <div className="page-enter notif-page">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'You are all caught up'}
        accentColor="#38BDF8"
        action={hasUnread ? {
          label:   markingAll ? 'Marking…' : 'Mark All Read',
          onClick: handleMarkAll,
          icon:    <MdDoneAll size={18} />,
        } : null}
      />

      {/* Filter tabs */}
      <div className="notif-filter">
        {['ALL', 'UNREAD'].map(f => (
          <button key={f}
            className={`notif-filter__btn${filter === f ? ' notif-filter__btn--active' : ''}`}
            onClick={() => setFilter(f)}>
            {f === 'ALL' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {loading && <SkeletonList count={5} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={<MdNotifications size={40} />}
          title={filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
          message={filter === 'UNREAD'
            ? 'All caught up! Switch to All to see previous notifications.'
            : 'Notifications about your tasks, goals, and system updates will appear here.'}
          action={filter === 'UNREAD'
            ? <button className="empty-state-action-btn" onClick={() => setFilter('ALL')}>View All</button>
            : null}
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="notif-list">
          {filtered.map(n => (
            <NotifItem
              key={n.id}
              notif={n}
              onRead={handleRead}
              onUnread={handleUnread}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Notification?"
        message="This notification will be permanently deleted."
      />
    </div>
  );
}
