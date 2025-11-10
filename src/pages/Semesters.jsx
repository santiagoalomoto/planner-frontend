import React, { useEffect, useState } from 'react'
import api from '../api/axiosConfig'
import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'
import SectionTitle from '../components/SectionTitle'

export default function Semesters() {
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null) // semestre en edición
  const [form, setForm] = useState({ name: '', year: '', start_date: '', end_date: '' })

  // -------------------
  // Helpers para fechas
  // -------------------
  const isoDateToDisplay = (iso) => {
    if (!iso) return ''
    // usa la parte antes de la 'T' si existe; así evitamos problemas de timezone
    const datePart = iso.split('T')[0]
    return datePart
  }

  const isoGetYear = (iso) => {
    if (!iso) return ''
    // toma los 4 primeros caracteres (YYYY)
    return iso.slice(0, 4)
  }

  // -------------------
  // Cargar semestres
  // -------------------
  const fetchSemesters = async () => {
    setLoading(true)
    try {
      const res = await api.get('/semesters')
      setSemesters(res.data || [])
    } catch (err) {
      console.error('Error al obtener semestres:', err)
      alert('❌ No se pudieron cargar los semestres.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSemesters()
  }, [])

  // -------------------
  // Validación
  // -------------------
  const validateForm = () => {
    if (!form.name.trim() || !form.year.trim()) {
      alert('⚠️ Debes ingresar un nombre y un año.')
      return false
    }
    if (isNaN(form.year) || form.year.length !== 4) {
      alert('⚠️ El año debe tener 4 dígitos válidos (ej: 2025).')
      return false
    }
    // prevenir duplicados exactos (nombre + año)
    const duplicate = semesters.some(
      (s) =>
        s.name.toLowerCase() === form.name.trim().toLowerCase() &&
        isoGetYear(s.start_date) === form.year.trim()
    )
    // si estamos editando y el duplicado es el mismo registro, permitimos
    if (duplicate && !(editing && (editing.id === undefined ? editing._id === undefined ? false : editing._id : editing.id))) {
      alert('⚠️ Ya existe un semestre con ese nombre y año.')
      return false
    }
    return true
  }

  // -------------------
  // Crear / Actualizar
  // -------------------
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const data = {
      name: form.name.trim(),
      start_date: `${form.year}-01-01`,
      end_date: `${form.year}-06-30`,
      status: 'active',
    }

    try {
      if (editing) {
        // id robusto: puede ser id, _id, uuid...
        const id = editing.id ?? editing._id ?? editing.uuid
        if (!id) throw new Error('ID del semestre inválido para edición.')
        await api.patch(`/semesters/${id}`, data)
        alert('✏️ Semestre actualizado correctamente.')
      } else {
        await api.post('/semesters', data)
        alert('✅ Semestre creado exitosamente.')
      }
      // reset
      setShowModal(false)
      setEditing(null)
      setForm({ name: '', year: '', start_date: '', end_date: '' })
      fetchSemesters()
    } catch (err) {
      console.error('Error al guardar semestre:', err)
      const message =
        err?.response?.data?.message || err?.response?.data || err.message || 'Error desconocido'
      alert(`❌ No se pudo guardar el semestre. ${message}`)
    }
  }

  // -------------------
  // Editar
  // -------------------
  const handleEdit = (semester) => {
    setEditing(semester)
    setForm({
      name: semester.name || '',
      year: isoGetYear(semester.start_date) || '',
      start_date: semester.start_date || '',
      end_date: semester.end_date || '',
    })
    setShowModal(true)
  }

  // -------------------
  // Eliminar
  // -------------------
  const handleDelete = async (idOrObj) => {
    // aceptar id directo o objeto semestre
    const id = typeof idOrObj === 'object' ? (idOrObj.id ?? idOrObj._id ?? idOrObj.uuid) : idOrObj
    if (!id) {
      alert('ID inválido para eliminar.')
      return
    }
    if (!window.confirm('🗑 ¿Seguro que deseas eliminar este semestre?')) return
    try {
      await api.delete(`/semesters/${id}`)
      alert('🗑️ Semestre eliminado.')
      fetchSemesters()
    } catch (err) {
      console.error('Error al eliminar semestre:', err)
      const message = err?.response?.data?.message || err?.message || 'Error desconocido'
      alert(`❌ No se pudo eliminar el semestre. ${message}`)
    }
  }

  // -------------------
  // Render helpers
  // -------------------
  const renderStatus = (status) => {
    const base = 'px-3 py-1 rounded-full text-xs font-semibold'
    switch (status) {
      case 'active':
        return <span className={`${base} bg-green-100 text-green-700`}>Activo</span>
      case 'draft':
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>Borrador</span>
      default:
        return <span className={`${base} bg-gray-200 text-gray-700`}>{status}</span>
    }
  }

  const renderActions = (semester) => (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => handleEdit(semester)}
        className="text-blue-600 hover:text-blue-800 transition"
        title="Editar"
        aria-label={`Editar ${semester.name}`}
      >
        ✏️
      </button>
      <button
        onClick={() => handleDelete(semester)}
        className="text-red-600 hover:text-red-800 transition"
        title="Eliminar"
        aria-label={`Eliminar ${semester.name}`}
      >
        🗑
      </button>
    </div>
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <SectionTitle title="📅 Gestión de Semestres" />
        <Button
          onClick={() => {
            setShowModal(true)
            setEditing(null)
            setForm({ name: '', year: '', start_date: '', end_date: '' })
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Nuevo Semestre
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500 animate-pulse">Cargando semestres...</div>
      ) : semesters.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm text-gray-500">
          No hay semestres registrados todavía.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <Table
            headers={['Nombre', 'Año', 'Fechas', 'Estado', 'Acciones']}
            data={semesters.map((s) => [
              s.name,
              isoGetYear(s.start_date),
              `${isoDateToDisplay(s.start_date)} → ${isoDateToDisplay(s.end_date)}`,
              renderStatus(s.status),
              renderActions(s),
            ])}
          />
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal
        open={showModal}
        title={editing ? 'Editar Semestre' : 'Nuevo Semestre'}
        onClose={() => {
          setShowModal(false)
          setEditing(null)
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              placeholder="Ej: Primer Semestre"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Año</label>
            <input
              name="year"
              value={form.year}
              onChange={handleChange}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              placeholder="Ej: 2025"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition">
            {editing ? 'Actualizar' : 'Guardar'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
