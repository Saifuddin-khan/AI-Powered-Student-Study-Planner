import api from './api';

const notificationService = {
  getAll:         (unreadOnly, size = 100) =>
    api.get('/notifications', { params: { ...(unreadOnly ? { unreadOnly: true } : {}), size } }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead:     (id) => api.patch(`/notifications/${id}/read`),
  markAsUnread:   (id) => api.patch(`/notifications/${id}/unread`),
  markAllRead:    ()   => api.patch('/notifications/read-all'),
  delete:         (id) => api.delete(`/notifications/${id}`),
};

export default notificationService;
