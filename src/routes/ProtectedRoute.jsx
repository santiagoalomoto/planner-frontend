import React, { useContext, useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user } = useContext(AuthContext)
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setAllowed(false)
      setLoading(false)
      return
    }

    if (!roles || (user && roles.includes(user.role))) {
      setAllowed(true)
    } else {
      setAllowed(false)
    }
    setLoading(false)
  }, [user, roles])

  if (loading) return <p>Cargando...</p>
  if (!allowed) return <Navigate to="/login" replace />

  return children
}
