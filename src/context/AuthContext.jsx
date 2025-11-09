import React, { createContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null
    } catch {
      return null
    }
  })

  const navigate = useNavigate() // ✅ Aquí lo usamos correctamente

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    // Aquí podrías validar el token o cargar usuario actual
  }, [])

  // 🔹 LOGIN
  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password })
      const token = res.data.access_token
      localStorage.setItem('token', token)

      try {
        const me = await api.get('/auth/me')
        localStorage.setItem('user', JSON.stringify(me.data))
        setUser(me.data)

        // Redirección según rol
        if (me.data.role === 'admin') navigate('/dashboard')
        else navigate('/dashboard')
      } catch (err) {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error en login:', error)
      alert('Error al iniciar sesión o credenciales incorrectas.')
    }
  }

  // 🔹 REGISTER
  const register = async (username, password, role) => {
    try {
      await api.post('/auth/register', { username, password, role })
      alert('Registro exitoso ✅. Ahora puedes iniciar sesión.')
      navigate('/login') // ✅ usa navigate en vez de window.location
    } catch (error) {
      console.error('Error en registro:', error)
      alert(error.response?.data?.message || 'Error al registrarse.')
    }
  }

  // 🔹 LOGOUT
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
