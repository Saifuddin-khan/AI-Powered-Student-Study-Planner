import api from './api';

const pomodoroService = {
  startSession:    (data) => api.post('/pomodoro/start', data),
  completeSession: (id)   => api.patch(`/pomodoro/${id}/complete`),
  getHistory:      (params = {}) => api.get('/pomodoro/history', { params }),
  deleteSession:   (id)   => api.delete(`/pomodoro/${id}`),
};

export default pomodoroService;
