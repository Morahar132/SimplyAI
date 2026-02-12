import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// API Methods
export const examAPI = {
  // Get all courses
  getCourses: () => api.get('/courses'),

  // Get subjects for a course
  getSubjects: (courseId) => api.get(`/courses/${courseId}/subjects`),

  // Get topics for a subject
  getTopics: (subjectId) => api.get(`/subjects/${subjectId}/topics`),

  // Get topics with embedded subtopics (Drona pattern - single call)
  getTopicsWithSubtopics: (subjectId) => api.get(`/topics/fetch-by-subject/${subjectId}`),

  // Get subtopics for a topic
  getSubtopics: (topicId) => api.get(`/topics/${topicId}/subtopics`),

  // Get question types enum
  getQuestionTypes: () => api.get('/enums/question-types'),

  // Get difficulties enum
  getDifficulties: () => api.get('/enums/difficulties'),

  // Fetch questions with filters
  fetchQuestions: (filters) => api.post('/questions/fetch', filters),

  // Get asset by ID
  getAsset: (assetId) => api.get(`/assets/${assetId}`),

  // Get AI review for practice session
  getAIReview: (sessionData) => api.post('/practice/ai-review', sessionData, { timeout: 30000 })
};

export default api;
