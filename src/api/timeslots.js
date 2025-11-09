import api from './axiosConfig'

export const getTimeslots = () => api.get('/timeslots')
export const createTimeslot = (data) => api.post('/timeslots', data)
export const updateTimeslot = (id, data) => api.patch(`/timeslots/${id}`, data)
export const deleteTimeslot = (id) => api.delete(`/timeslots/${id}`)
