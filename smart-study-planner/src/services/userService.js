import api from './api';

const userService = {
  getProfile:    ()     => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export default userService;
