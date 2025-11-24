import React, { useEffect, useState } from 'react'
import {
  getAuditLogs,
  getAuditLogsByUser,
  getAuditLogsByEntity,
  clearAuditLogs,
} from '../api/auditLogs'
import { 
  FileText, 
  Search, 
  Trash2, 
  User, 
  Tag,
  Clock,
  Activity,
  Database,
  Filter
} from 'lucide-react'

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

  const fetchLogs = async () => {
    try {
      setLoading(true)
      let data

      if (filters.userId && !filters.entityType) {
        data = await getAuditLogsByUser(filters.userId)
      } else if (!filters.userId && filters.entityType) {
        data = await getAuditLogsByEntity(filters.entityType)
      } else if (filters.userId && filters.entityType) {
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

  const handleClear = async () => {
    if (!window.confirm('¿Seguro que deseas eliminar todos los registros de auditoría?')) return
    try {
      await clearAuditLogs()
      fetchLogs()
    } catch (err) {
      console.error('Error al limpiar logs', err)
    }
  }

  const getActionColor = (action) => {
    const colors = {
      'CREATE': 'bg-green-100 text-green-700 border-green-200',
      'UPDATE': 'bg-blue-100 text-blue-700 border-blue-200',
      'DELETE': 'bg-red-100 text-red-700 border-red-200',
      'READ': 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return colors[action] || 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const SkeletonRow = () => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      {/* Header Premium */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="text-white" size={20} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Registros de Auditoría</h1>
        </div>
        <p className="text-slate-600 ml-13">Historial completo de actividades del sistema YAVIRAC</p>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-slate-600" size={20} />
          <h3 className="font-semibold text-slate-700">Filtros de búsqueda</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro Usuario */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <User size={14} className="inline mr-1" />
              Usuario
            </label>
            <select
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            >
              <option value="">Todos los usuarios</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.username || user.email || `ID: ${user.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Entidad */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Tag size={14} className="inline mr-1" />
              Entidad
            </label>
            <select
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={filters.entityType}
              onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
            >
              <option value="">Todas las entidades</option>
              {entities.map((ent) => (
                <option key={ent.value} value={ent.value}>
                  {ent.label}
                </option>
              ))}
            </select>
          </div>

          {/* Botones */}
          <div className="flex items-end gap-2">
            <button
              onClick={fetchLogs}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Search size={18} />
              <span>Buscar</span>
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Trash2 size={18} />
              <span>Limpiar todo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Registros</p>
              <p className="text-3xl font-bold text-gray-700">{logs.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center shadow-lg">
              <Database className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium mb-1">Creaciones</p>
              <p className="text-3xl font-bold text-green-700">
                {logs.filter(l => l.action === 'CREATE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium mb-1">Actualizaciones</p>
              <p className="text-3xl font-bold text-blue-700">
                {logs.filter(l => l.action === 'UPDATE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium mb-1">Eliminaciones</p>
              <p className="text-3xl font-bold text-red-700">
                {logs.filter(l => l.action === 'DELETE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Trash2 className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-100">
          <FileText className="mx-auto text-slate-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No hay registros</h3>
          <p className="text-slate-500">No se encontraron registros de auditoría con los filtros aplicados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="group bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="text-white" size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full border border-slate-200">
                        {log.entity_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-shrink-0">
                      <Clock size={14} />
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-slate-400" />
                      <span>
                        <strong>Usuario:</strong> {log.user?.name || log.user?.username || log.user?.email || log.user_id || 'N/A'}
                      </span>
                    </div>
                    {log.entity_id && (
                      <div className="flex items-center gap-1.5">
                        <Tag size={14} className="text-slate-400" />
                        <span>
                          <strong>ID:</strong> {log.entity_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AuditLogs