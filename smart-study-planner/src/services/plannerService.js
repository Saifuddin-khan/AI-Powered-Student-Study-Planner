import api from './api';

const plannerService = {
  create:         (data)   => api.post('/study-plans', data),
  getByDate:      (date)   => api.get('/study-plans/daily', { params: { date } }),
  getByRange:     (from, to) => api.get('/study-plans/range', { params: { from, to } }),
  getById:        (id)     => api.get(`/study-plans/${id}`),
  update:         (id, data) => api.put(`/study-plans/${id}`, data),
  toggleComplete: (id)     => api.patch(`/study-plans/${id}/toggle-complete`),
  delete:         (id)     => api.delete(`/study-plans/${id}`),
};

export default plannerService;
