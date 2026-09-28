import api from './api';

const syllabusService = {
  upload: (subjectId, file) => {
    const formData = new FormData();
    formData.append('subjectId', subjectId);
    formData.append('file', file);
    return api.post('/syllabus/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getById:      (id) => api.get(`/syllabus/${id}`),
  getBySubject: (subjectId, params = {}) => api.get(`/syllabus/subject/${subjectId}`, { params }),
  delete:       (id) => api.delete(`/syllabus/${id}`),
};

export default syllabusService;
