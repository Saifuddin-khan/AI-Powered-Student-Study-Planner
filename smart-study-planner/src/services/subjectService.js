import api from './api';

const subjectService = {
  create:  (data) => api.post('/subjects', data),
  getAll:  ()     => api.get('/subjects'),
  getById: (id)   => api.get(`/subjects/${id}`),
  update:  (id, data) => api.put(`/subjects/${id}`, data),
  delete:  (id)   => api.delete(`/subjects/${id}`),
};

export default subjectService;
