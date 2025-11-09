// src/services/enrollmentsService.js
import axios from "axios";
import { getToken } from "./auth"; // ✅ ajusta según tu implementación

const API_URL = "http://localhost:3000/api/enrollments";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const getEnrollments = async () => {
  return axios.get(API_URL, authHeaders());
};

export const createEnrollment = async (data) => {
  return axios.post(API_URL, data, authHeaders());
};

export const updateEnrollment = async (id, data) => {
  return axios.patch(`${API_URL}/${id}`, data, authHeaders());
};

export const deleteEnrollment = async (id) => {
  return axios.delete(`${API_URL}/${id}`, authHeaders());
};
