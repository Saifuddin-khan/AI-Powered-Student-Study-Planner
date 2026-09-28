import api from './api';

const timetableService = {
  create:     (data) => api.post('/timetable', data),
  getWeekly:  ()     => api.get('/timetable'),
  getByDay:   (day)  => api.get(`/timetable/day/${day}`),
  getById:    (id)   => api.get(`/timetable/${id}`),
  update:     (id, data) => api.put(`/timetable/${id}`, data),
  delete:     (id)   => api.delete(`/timetable/${id}`),
};

export default timetableService;
