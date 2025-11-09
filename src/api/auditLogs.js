import api from './axios' // Usa tu instancia configurada con el token baseURL

const endpoint = '/audit-logs'

// Obtener todos los logs
export const getAuditLogs = async () => {
  const res = await api.get(endpoint)
  return res.data
}

// Filtrar por usuario
export const getAuditLogsByUser = async (userId) => {
  const res = await api.get(`${endpoint}/user/${userId}`)
  return res.data
}

// Filtrar por entidad
export const getAuditLogsByEntity = async (entityType) => {
  const res = await api.get(`${endpoint}/entity/${entityType}`)
  return res.data
}

// Eliminar todos
export const clearAuditLogs = async () => {
  const res = await api.delete(`${endpoint}/clear`)
  return res.data
}
