import api from './axios'

export const getSections = () => api.get('/sections')
export const getSectionById = (id) => api.get(`/sections/${id}`)
export const createSection = (data) => api.post('/sections', data)
export const updateSection = (id, data) => api.patch(`/sections/${id}`, data)
export const deleteSection = (id) => api.delete(`/sections/${id}`)
