import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4090/api'

// Environment detection
const isProduction = API_BASE_URL.includes('vercel.app') || API_BASE_URL.includes('netlify.app')

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: isProduction ? 15000 : 10000, // Longer timeout for production
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies in requests
})

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api
