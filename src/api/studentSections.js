import api from './axios'

export const getStudentSections = () => api.get('/student-sections')
export const getStudentSectionById = (id) => api.get(`/student-sections/${id}`)
export const createStudentSection = (data) => api.post('/student-sections', data)
export const updateStudentSection = (id, data) => api.patch(`/student-sections/${id}`, data)
export const deleteStudentSection = (id) => api.delete(`/student-sections/${id}`)
