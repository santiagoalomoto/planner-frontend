import axios from 'axios'

// ✅ URL base del backend (usa variable de entorno o localhost)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000/api',
  withCredentials: true, // 🔹 Permite cookies/sesión entre dominios
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
