// src/api/client.js
import axios from 'axios'

// ✅ Use environment variable with fallback for local development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

console.log('🔗 API URL:', API_URL)  // Helpful for debugging

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to every request if it exists
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle 401 responses (unauthorized)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const api = {
  // Auth
  register: (email, password) => client.post('/auth/register', { email, password }),
  login: (email, password) => client.post('/auth/login', { email, password }),
  getMe: () => client.get('/auth/me'),

  // Topics
  getTopics: () => client.get('/topics'),
  getTopic: (id) => client.get(`/topics/${id}`),
  createTopic: (data) => client.post('/topics', data),
  updateTopic: (id, data) => client.put(`/topics/${id}`, data),
  deleteTopic: (id) => client.delete(`/topics/${id}`),

  // Resources
  createResource: (topicId, data) => client.post(`/topics/${topicId}/resources`, data),
  deleteResource: (id) => client.delete(`/resources/${id}`),

  // Notes
  createNote: (topicId, data) => client.post(`/topics/${topicId}/notes`, data),
  updateNote: (id, data) => client.put(`/notes/${id}`, data),
  deleteNote: (id) => client.delete(`/notes/${id}`),
}

export default client