import api from './api';

const authService = {
  register: (data) =>
    api.post('/auth/register', data),

  login: (data) =>
    api.post('/auth/login', data),

  refreshToken: (refreshToken) =>
    api.post('/auth/refresh-token', { refreshToken }),

  logout: (refreshToken) =>
    api.post('/auth/logout', { refreshToken }),

  changePassword: (data) =>
    api.post('/auth/change-password', data),
};

export default authService;
