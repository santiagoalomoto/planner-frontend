import React, { useEffect, useState } from 'react'
import api from '../api/axiosConfig'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter
} from 'lucide-react'

export default function Semesters() {
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [year, setYear] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Cargar semestres
  const fetchSemesters = async () => {
    setLoading(true)
    try {
      const res = await api.get('/semesters')
      setSemesters(res.data)
    } catch (err) {
      console.error('Error al obtener semestres:', err.response?.data || err)
      alert('No se pudieron cargar los semestres.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSemesters()
  }, [])

  // Crear semestre
  const createSemester = async (e) => {
    e.preventDefault()
    if (!name || !year) return

    try {
      const res = await api.post('/semesters', {
        name,
        start_date: `${year}-01-01`,
        end_date: `${year}-06-30`,
        status: 'active'
      })
      console.log('Semestre creado:', res.data)
      setShowModal(false)
      setName('')
      setYear('')
      fetchSemesters()
    } catch (err) {
      console.error('Error al crear semestre:', err.response?.data || err)
      alert(`No se pudo crear el semestre. Error: ${err.response?.data?.message || err.message}`)
    }
  }

  // Filtrar semestres
  const filteredSemesters = semesters.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Badge mejorado para estado
  const renderStatus = (status) => {
    const badges = {
      active: {
        icon: CheckCircle,
        text: 'Activo',
        className: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
        dotColor: 'bg-green-300'
      },
      draft: {
        icon: Clock,
        text: 'Borrador',
        className: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
        dotColor: 'bg-yellow-300'
      },
      inactive: {
        icon: AlertCircle,
        text: 'Inactivo',
        className: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
        dotColor: 'bg-gray-300'
      }
    }

    const badge = badges[status] || badges.draft
    const Icon = badge.icon

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium shadow-lg ${badge.className}`}>
        <div className={`w-2 h-2 rounded-full ${badge.dotColor} animate-pulse`}></div>
        <Icon size={14} />
        <span>{badge.text}</span>
      </div>
    )
  }

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-3 flex-1">
          <div className="h-6 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="h-8 w-24 bg-slate-200 rounded-full"></div>
      </div>
      <div className="h-4 bg-slate-200 rounded w-full"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      {/* Header Premium */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Calendar className="text-white" size={20} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Gestión de Semestres</h1>
        </div>
        <p className="text-slate-600 ml-13">Administra los períodos académicos de YAVIRAC</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 mb-6">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar semestre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-slate-700 font-medium">
              <Filter size={18} />
              <span>Filtros</span>
            </button>
            
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <Plus size={18} />
              <span>Nuevo Semestre</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium mb-1">Total Semestres</p>
              <p className="text-3xl font-bold text-blue-700">{semesters.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium mb-1">Activos</p>
              <p className="text-3xl font-bold text-green-700">
                {semesters.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium mb-1">Borradores</p>
              <p className="text-3xl font-bold text-orange-700">
                {semesters.filter(s => s.status === 'draft').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Semester Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filteredSemesters.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-100">
          <Calendar className="mx-auto text-slate-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No hay semestres</h3>
          <p className="text-slate-500 mb-6">Comienza creando tu primer período académico</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={18} />
            Crear Semestre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSemesters.map((semester) => (
            <div
              key={semester.id}
              className="group bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {semester.name}
                  </h3>
                  {renderStatus(semester.status || 'draft')}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={16} className="text-blue-500" />
                  <span className="text-sm">
                    <strong>Inicio:</strong> {semester.start_date?.split('T')[0] || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={16} className="text-orange-500" />
                  <span className="text-sm">
                    <strong>Fin:</strong> {semester.end_date?.split('T')[0] || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Duration Info */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock size={16} className="text-blue-500" />
                  <span className="font-medium">Duración: 6 meses</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Premium */}
      <Modal
        open={showModal}
        title="Crear Nuevo Semestre"
        onClose={() => {
          setShowModal(false)
          setName('')
          setYear('')
        }}
      >
        <form onSubmit={createSemester} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre del Semestre
            </label>
            <input
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ej: Primer Semestre 2025"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Año
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="2025"
              value={year}
              onChange={e => setYear(e.target.value)}
              min="2020"
              max="2030"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-3 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Crear Semestre
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}