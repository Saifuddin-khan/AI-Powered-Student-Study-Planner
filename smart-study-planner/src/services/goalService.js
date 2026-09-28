import api from './api';

const goalService = {
  create:         (data)   => api.post('/goals', data),
  getAll:         (params = {}) => api.get('/goals', { params }),
  getById:        (id)     => api.get(`/goals/${id}`),
  update:         (id, data) => api.put(`/goals/${id}`, data),
  updateProgress: (id, currentValue) =>
    api.patch(`/goals/${id}/progress`, { currentValue }),
  updateStatus:   (id, status) =>
    api.patch(`/goals/${id}/status`, { status }),
  delete:         (id)     => api.delete(`/goals/${id}`),
};

export default goalService;
