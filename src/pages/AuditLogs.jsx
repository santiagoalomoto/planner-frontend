import React, { useEffect, useState } from 'react'
import {
  getAuditLogs,
  getAuditLogsByUser,
  getAuditLogsByEntity,
  clearAuditLogs,
} from '../api/auditLogs'
import Table from '../components/Table'
import Button from '../components/Button'
import SectionTitle from '../components/SectionTitle'

const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ userId: '', entityType: '' })
  const [users, setUsers] = useState([])

  const [entities] = useState([
    { label: 'Cursos', value: 'course' },
    { label: 'Semestres', value: 'semester' },
    { label: 'Estudiantes', value: 'student' },
    { label: 'Docentes', value: 'teacher' },
    { label: 'Ofertas', value: 'offering' },
    { label: 'Secciones', value: 'section' },
    { label: 'Usuarios', value: 'user' },
  ])

  // ✅ Obtener usuarios (con token si el backend lo requiere)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3000/api/users', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        })

        if (!res.ok) throw new Error('Error al obtener usuarios')

        const data = await res.json()
        setUsers(data)
      } catch (err) {
        console.error('Error al cargar usuarios:', err)
      }
    }

    fetchUsers()
  }, [])

  // ✅ Obtener logs (según filtros)
  const fetchLogs = async () => {
    try {
      setLoading(true)
      let data

      if (filters.userId && !filters.entityType) {
        data = await getAuditLogsByUser(filters.userId)
      } else if (!filters.userId && filters.entityType) {
        data = await getAuditLogsByEntity(filters.entityType)
      } else if (filters.userId && filters.entityType) {
        // 🔹 Nuevo: combinar ambos filtros
        const byUser = await getAuditLogsByUser(filters.userId)
        data = byUser.filter((log) => log.entity_type === filters.entityType)
      } else {
        data = await getAuditLogs()
      }

      setLogs(data)
    } catch (err) {
      console.error('Error al obtener logs', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  // ✅ Limpiar todos los registros
  const handleClear = async () => {
    if (!window.confirm('¿Seguro que deseas eliminar todos los registros de auditoría?')) return
    try {
      await clearAuditLogs()
      fetchLogs()
    } catch (err) {
      console.error('Error al limpiar logs', err)
    }
  }

  return (
    <div className="p-6">
      <SectionTitle title="📜 Registros de Auditoría del Sistema" />

      {/* 🔍 Filtros */}
      <div className="bg-gray-50 p-4 rounded-xl shadow-sm mb-5">
        <h3 className="font-semibold text-gray-700 mb-3">Filtros</h3>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Filtro por usuario */}
          <select
            className="border rounded-lg px-3 py-2 text-sm text-gray-700"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
          >
            <option value="">👤 Todos los usuarios</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.username || user.email || `ID: ${user.id}`}
              </option>
            ))}
          </select>

          {/* Filtro por entidad */}
          <select
            className="border rounded-lg px-3 py-2 text-sm text-gray-700"
            value={filters.entityType}
            onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
          >
            <option value="">🏷️ Todas las entidades</option>
            {entities.map((ent) => (
              <option key={ent.value} value={ent.value}>
                {ent.label}
              </option>
            ))}
          </select>

          <Button onClick={fetchLogs}>🔍 Buscar</Button>
          <Button onClick={handleClear} variant="danger">
            🗑 Limpiar todo
          </Button>
        </div>
      </div>

      {/* 📋 Tabla de logs */}
      {loading ? (
        <p className="text-gray-500 italic">Cargando registros...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500 italic">No hay registros de auditoría disponibles.</p>
      ) : (
        <Table
          headers={['👤 Usuario', '🛠 Acción', '📁 Entidad', '🆔 ID Entidad', '🕒 Fecha']}
          data={logs.map((log) => [
            log.user?.name ||
              log.user?.username ||
              log.user?.email ||
              log.user_id ||
              '—',
            log.action,
            log.entity_type,
            log.entity_id || '—',
            new Date(log.created_at).toLocaleString(),
          ])}
        />
      )}
    </div>
  )
}

export default AuditLogs
