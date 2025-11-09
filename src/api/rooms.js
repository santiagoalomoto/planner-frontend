import api from './axiosConfig' // tu configuración de Axios

export const getRooms = () => api.get('/rooms')
export const createRoom = (data) => api.post('/rooms', data)
export const updateRoom = (id, data) => api.patch(`/rooms/${id}`, data)
export const deleteRoom = (id) => api.delete(`/rooms/${id}`)
