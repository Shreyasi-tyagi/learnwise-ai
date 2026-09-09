import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 60000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('learnwise_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const generatePractice = async () => {
  const response = await api.post('/learning/practice/generate')
  return response.data
}

export const submitPractice = async (practiceId, answers) => {
  const response = await api.post('/learning/practice/submit', { practiceId, answers })
  return response.data
}

export const sendMentorMessage = async (message, history = []) => {
  const response = await api.post('/learning/mentor', { message, history })
  return response.data
}
