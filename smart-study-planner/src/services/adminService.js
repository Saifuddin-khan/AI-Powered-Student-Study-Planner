import api from './api';

// ── USER MANAGEMENT ─────────────────────────────────────────────
const getUsers = (page = 0, size = 20, search = '') =>
  api.get('/admin/users', { params: { page, size, ...(search && { search }) } });

const getUserById = (id) => api.get(`/admin/users/${id}`);

const createUser = (data) => api.post('/admin/users', data);

const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);

const changeUserRole = (id, newRole) =>
  api.put(`/admin/users/${id}/role`, null, { params: { newRole } });

const resetUserPassword = (id, newPassword) =>
  api.post(`/admin/users/${id}/password/reset`, null, { params: { newPassword } });

const disableUser = (id, reason = '') =>
  api.put(`/admin/users/${id}/disable`, null, { params: { reason } });

const enableUser = (id) => api.put(`/admin/users/${id}/enable`);

const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// ── IMPERSONATION ────────────────────────────────────────────────
const startImpersonation = (userId) =>
  api.post(`/admin/users/${userId}/impersonate`);

const exitImpersonation = (sessionToken) =>
  api.post('/admin/impersonate/exit', null, { params: { sessionToken } });

// ── NOTIFICATIONS ────────────────────────────────────────────────
const getNotifications = (page = 0, size = 20) =>
  api.get('/admin/notifications', { params: { page, size } });

const createNotification = (title, message, type, isGlobal = false) =>
  api.post('/admin/notifications', { title, message, type, isGlobal });

const sendNotification = (id, userIds = null) =>
  api.post(`/admin/notifications/${id}/send`, null,
    userIds ? { params: { userIds } } : {});

const getNotificationsByType = (type, page = 0, size = 20) =>
  api.get(`/admin/notifications/type/${type}`, { params: { page, size } });

const getDeliveryStatus = (id) =>
  api.get(`/admin/notifications/${id}/delivery-status`);

const deleteNotification = (id) => api.delete(`/admin/notifications/${id}`);

// ── ANALYTICS ────────────────────────────────────────────────────
const getDashboardStats    = () => api.get('/admin/analytics/dashboard');
const getUserAnalytics     = () => api.get('/admin/analytics/users');
const getTaskAnalytics     = () => api.get('/admin/analytics/tasks');
const getSubjectAnalytics  = () => api.get('/admin/analytics/subjects');
const getPomodoroAnalytics = () => api.get('/admin/analytics/pomodoro');
const getNotifAnalytics    = () => api.get('/admin/analytics/notifications');

const generateReport = (startDate, endDate) =>
  api.post('/admin/analytics/report', null, { params: { startDate, endDate } });

const exportReport = (reportType, format = 'csv') =>
  api.post('/admin/analytics/export', null, {
    params: { reportType, format },
    responseType: 'blob',
  });

// ── CONTENT ──────────────────────────────────────────────────────
const getContentStats  = () => api.get('/admin/content/statistics');
const getAllSubjects    = (page = 0, size = 20) => api.get('/admin/content/subjects', { params: { page, size } });
const getAllTasks       = (page = 0, size = 20) => api.get('/admin/content/tasks', { params: { page, size } });
const getAllNotes       = (page = 0, size = 20) => api.get('/admin/content/notes', { params: { page, size } });
const getAllGoals       = (page = 0, size = 20) => api.get('/admin/content/goals', { params: { page, size } });
const deleteSubject    = (id) => api.delete(`/admin/content/subjects/${id}`);
const deleteTask       = (id) => api.delete(`/admin/content/tasks/${id}`);
const deleteNote       = (id) => api.delete(`/admin/content/notes/${id}`);
const deleteGoal       = (id) => api.delete(`/admin/content/goals/${id}`);

// ── SETTINGS ─────────────────────────────────────────────────────
const getSetting    = (key)         => api.get(`/admin/settings/${key}`);
const updateSetting = (key, value)  => api.put(`/admin/settings/${key}`, null, { params: { value } });

const adminService = {
  getUsers, getUserById, createUser, updateUser, changeUserRole,
  resetUserPassword, disableUser, enableUser, deleteUser,
  startImpersonation, exitImpersonation,
  getNotifications, createNotification, sendNotification,
  getNotificationsByType, getDeliveryStatus, deleteNotification,
  getDashboardStats, getUserAnalytics, getTaskAnalytics,
  getSubjectAnalytics, getPomodoroAnalytics, getNotifAnalytics,
  generateReport, exportReport,
  getContentStats, getAllSubjects, getAllTasks, getAllNotes, getAllGoals,
  deleteSubject, deleteTask, deleteNote, deleteGoal,
  getSetting, updateSetting,
};

export default adminService;
