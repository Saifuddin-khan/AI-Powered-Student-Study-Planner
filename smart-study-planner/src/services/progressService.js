import api from './api';

const progressService = {
  logSession:  (data) => api.post('/progress', data),
  getLogs:     (params = {}) => api.get('/progress', { params }),
  getById:     (id)   => api.get(`/progress/${id}`),
  getSummary:  ()     => api.get('/progress/summary'),
  delete:      (id)   => api.delete(`/progress/${id}`),
};

export default progressService;
