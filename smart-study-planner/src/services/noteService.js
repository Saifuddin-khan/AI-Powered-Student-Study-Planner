import api from './api';

const noteService = {
  create:  (data)  => api.post('/notes', data),
  getAll:  (params = {}) => api.get('/notes', { params }),
  getById: (id)    => api.get(`/notes/${id}`),
  update:  (id, data) => api.put(`/notes/${id}`, data),
  delete:  (id)    => api.delete(`/notes/${id}`),
};

export default noteService;
