// src/pages/Timeslots.jsx
import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'
import SectionTitle from '../components/SectionTitle'

export default function Timeslots() {
  const [timeslots, setTimeslots] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const [form, setForm] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    duration_minutes: '',
  })

  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

  // 🔹 Cargar horarios
  const fetchTimeslots = async () => {
    setLoading(true)
    try {
      const res = await api.get('/timeslots')
      setTimeslots(res.data || [])
    } catch (err) {
      console.error('Error al obtener horarios:', err)
      alert('❌ No se pudieron cargar los horarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTimeslots()
  }, [])

  // 🔹 Validación
  const validateTimeslot = ({ start_time, end_time, duration_minutes }) => {
    if (!start_time || !end_time) return 'Debe seleccionar una hora de inicio y fin.'
    const start = new Date(`1970-01-01T${start_time}:00`)
    const end = new Date(`1970-01-01T${end_time}:00`)
    if (end <= start) return 'La hora de fin debe ser mayor que la de inicio.'
    if (!duration_minutes || duration_minutes <= 0)
      return 'La duración debe ser mayor a 0 minutos.'
    const diffMinutes = (end - start) / 60000
    if (diffMinutes < duration_minutes)
      return 'La duración no puede ser mayor que el intervalo total.'
    return null
  }

  const checkOverlap = (payload) => {
    return timeslots.some((t) => {
      if (editing && (t.id === editing.id || t._id === editing._id)) return false
      if (t.day_of_week !== payload.day_of_week) return false
      const startNew = new Date(`1970-01-01T${payload.start_time}:00`)
      const endNew = new Date(`1970-01-01T${payload.end_time}:00`)
      const startExist = new Date(`1970-01-01T${t.start_time}:00`)
      const endExist = new Date(`1970-01-01T${t.end_time}:00`)
      return startNew < endExist && endNew > startExist
    })
  }

  // 🔹 Guardar o actualizar horario
  const handleSubmit = async (e) => {
    e.preventDefault()

    const error = validateTimeslot(form)
    if (error) return alert(error)

    const payload = {
      day_of_week: parseInt(form.day_of_week, 10),
      start_time: form.start_time,
      end_time: form.end_time,
      duration_minutes: parseInt(form.duration_minutes, 10),
    }

    if (checkOverlap(payload)) return alert('⚠️ Este horario se solapa con otro existente.')

    try {
      if (editing) {
        const id = editing.id ?? editing._id
        await api.patch(`/timeslots/${id}`, payload)
        alert('✏️ Horario actualizado correctamente.')
      } else {
        await api.post('/timeslots', payload)
        alert('✅ Horario creado correctamente.')
      }

      setShowModal(false)
      setEditing(null)
      setForm({ day_of_week: '', start_time: '', end_time: '', duration_minutes: '' })
      fetchTimeslots()
    } catch (err) {
      console.error('Error al guardar horario:', err)
      alert('❌ No se pudo guardar el horario.')
    }
  }

  // 🔹 Editar horario
  const handleEdit = (t) => {
    setEditing(t)
    setForm({
      day_of_week: t.day_of_week,
      start_time: t.start_time,
      end_time: t.end_time,
      duration_minutes: t.duration_minutes,
    })
    setShowModal(true)
  }

  // 🔹 Eliminar horario
  const handleDelete = async (t) => {
    const id = t.id ?? t._id
    if (!window.confirm('🗑️ ¿Seguro que deseas eliminar este horario?')) return
    try {
      await api.delete(`/timeslots/${id}`)
      alert('🗑️ Horario eliminado correctamente.')
      fetchTimeslots()
    } catch (err) {
      console.error('Error al eliminar horario:', err)
      alert('❌ No se pudo eliminar el horario.')
    }
  }

  // 🔹 Manejar cambios del formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  // 🔹 Renderizar acciones
  const renderActions = (t) => (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => handleEdit(t)}
        className="text-blue-600 hover:text-blue-800 transition"
        title="Editar horario"
      >
        ✏️
      </button>
      <button
        onClick={() => handleDelete(t)}
        className="text-red-600 hover:text-red-800 transition"
        title="Eliminar horario"
      >
        🗑
      </button>
    </div>
  )

  return (
    <div className="p-6 animate-fadeIn">
      {/* 🔹 Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <SectionTitle title="🕓 Gestión de Horarios" />
        <Button
          onClick={() => {
            setShowModal(true)
            setEditing(null)
            setForm({ day_of_week: '', start_time: '', end_time: '', duration_minutes: '' })
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Nuevo Horario
        </Button>
      </div>

      {/* 🔹 Tabla */}
      {loading ? (
        <div className="text-center py-8 text-gray-500 animate-pulse">Cargando horarios...</div>
      ) : timeslots.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm text-gray-500">
          No hay horarios registrados todavía.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <Table
            headers={['Día', 'Inicio', 'Fin', 'Duración (min)', 'Acciones']}
            data={timeslots.map((t) => [
              dayNames[t.day_of_week - 1],
              t.start_time,
              t.end_time,
              `${t.duration_minutes} min`,
              renderActions(t),
            ])}
          />
        </div>
      )}

      {/* 🔹 Modal Crear/Editar */}
      <Modal
        open={showModal}
        title={editing ? 'Editar Horario' : 'Nuevo Horario'}
        onClose={() => {
          setShowModal(false)
          setEditing(null)
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Día */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Día de la semana</label>
            <select
              name="day_of_week"
              value={form.day_of_week}
              onChange={handleChange}
              required
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
            >
              <option value="">Selecciona un día</option>
              {dayNames.map((d, i) => (
                <option key={i} value={i + 1}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Hora inicio */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Hora de inicio</label>
            <input
              type="time"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              required
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
            />
          </div>

          {/* Hora fin */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Hora de fin</label>
            <input
              type="time"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              required
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
            />
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Duración (minutos)</label>
            <input
              type="number"
              name="duration_minutes"
              value={form.duration_minutes}
              onChange={handleChange}
              min="1"
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              placeholder="Ej: 90"
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
