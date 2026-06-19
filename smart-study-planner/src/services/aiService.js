import api from './api';

const aiService = {
  sendMessage:    (message) => api.post('/ai/chat', { message }),
  getChatHistory: (size = 100) => api.get('/ai/chat/history', { params: { size } }),
  clearHistory:   ()        => api.delete('/ai/chat/history'),
};

export default aiService;
