import api from './api';

const taskService = {
  create:  (data) => api.post('/tasks', data),
  getAll:  (params = {}) => api.get('/tasks', { params }),
  getById: (id)   => api.get(`/tasks/${id}`),
  update:  (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  delete:  (id)   => api.delete(`/tasks/${id}`),
  deleteAll: () => api.delete('/tasks/bulk/delete-all'),
};

export default taskService;
