// src/api/auth.js
export function getToken() {
  return localStorage.getItem('token')
}
