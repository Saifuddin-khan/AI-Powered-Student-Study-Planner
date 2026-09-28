import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  MdNotifications, MdDeleteOutline, MdCheckCircle,
  MdInfo, MdWarning, MdError, MdSuccess
} from 'react-icons/md';

import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import { SkeletonList } from '../../components/ui/Skeleton/Skeleton';
import './notifications.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const unreadOnly = filter === 'unread';
      const res = await api.get('/notifications', {
        params: { unreadOnly, page, size: 20 }
      });

      const data = res.data?.data;
      if (page === 0) {
        setNotifications(data?.content || []);
      } else {
        setNotifications(prev => [...prev, ...(data?.content || [])]);
      }
      setHasMore(data?.totalPages > page + 1);
    } catch (err) {
      toast.error('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.isRead);

  const getTypeIcon = (type) => {
    const styles = {
      INFO: { icon: <MdInfo />, color: 'info' },
      WARNING: { icon: <MdWarning />, color: 'warning' },
      ERROR: { icon: <MdError />, color: 'error' },
      SUCCESS: { icon: <MdSuccess />, color: 'success' },
    };
    return styles[type] || styles.INFO;
  };

  return (
    <div className="page notif-page">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with task reminders, reviews, and exam alerts"
      />

      <div className="notif-header">
        <div className="notif-tabs">
          <button
            className={`notif-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => { setFilter('all'); setPage(0); }}
          >
            All ({notifications.length})
          </button>
          <button
            className={`notif-tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => { setFilter('unread'); setPage(0); }}
          >
            Unread ({notifications.filter(n => !n.isRead).length})
          </button>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button className="btn btn-secondary" onClick={handleMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {loading && page === 0 ? (
        <SkeletonList count={5} />
      ) : filteredNotifications.length === 0 ? (
        <div className="empty-state">
          <MdNotifications size={48} />
          <h3>No Notifications</h3>
          <p>
            {filter === 'unread'
              ? 'You\'re all caught up!'
              : 'Check back later for updates'}
          </p>
        </div>
      ) : (
        <div className="notif-list">
          {filteredNotifications.map(notif => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              getTypeIcon={getTypeIcon}
            />
          ))}

          {hasMore && (
            <button
              className="btn btn-outline"
              onClick={() => setPage(prev => prev + 1)}
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete, getTypeIcon }) => {
  const typeInfo = getTypeIcon(notification.type);
  const createdAt = new Date(notification.createdAt);
  const timeAgo = getTimeAgo(createdAt);

  return (
    <div className={`notif-item ${!notification.isRead ? 'unread' : ''}`}>
      <div className={`notif-icon ${typeInfo.color}`}>
        {typeInfo.icon}
      </div>

      <div className="notif-content">
        <h4 className="notif-title">{notification.title}</h4>
        <p className="notif-message">{notification.message}</p>
        <span className="notif-time">{timeAgo}</span>
      </div>

      <div className="notif-actions">
        {!notification.isRead && (
          <button
            className="notif-action-btn"
            onClick={() => onMarkAsRead(notification.id)}
            title="Mark as read"
          >
            <MdCheckCircle size={18} />
          </button>
        )}
        <button
          className="notif-action-btn delete"
          onClick={() => onDelete(notification.id)}
          title="Delete"
        >
          <MdDeleteOutline size={18} />
        </button>
      </div>
    </div>
  );
};

const getTimeAgo = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default NotificationsPage;
