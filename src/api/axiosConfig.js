import axios from 'axios'

// Instancia de Axios para todas las peticiones al backend
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Cambia si tu backend usa otro puerto
  withCredentials: true, // necesario si backend valida cookies/sesión
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor: agrega automáticamente el token JWT a cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor: maneja respuestas 401 (token inválido o expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Token inválido o expirado. Redirigiendo al login...')
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
