import React, { useEffect, useState } from 'react'
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from '../api/sections'
import { getOfferings } from '../api/offerings'
import { getRooms } from '../api/rooms'
import { getTimeslots } from '../api/timeslots'

import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'
import SectionTitle from '../components/SectionTitle'
import { FaEdit, FaTrash, FaDoorOpen, FaClock } from 'react-icons/fa'

export default function Sections() {
  const [sections, setSections] = useState([])
  const [offerings, setOfferings] = useState([])
  const [rooms, setRooms] = useState([])
  const [timeslots, setTimeslots] = useState([])

  const [form, setForm] = useState({
    offeringId: '',
    code: '',
    capacity: 0,
    assignedRoomId: '',
    assignedTimeslotId: '',
  })

  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // 🔹 Cargar datos iniciales
  const loadData = async () => {
    try {
      setLoading(true)
      const [secRes, offRes, roomRes, tsRes] = await Promise.all([
        getSections(),
        getOfferings(),
        getRooms(),
        getTimeslots(),
      ])

      const secData = Array.isArray(secRes.data) ? secRes.data : secRes.data.data
      const offData = Array.isArray(offRes.data) ? offRes.data : offRes.data.data
      const roomData = Array.isArray(roomRes.data) ? roomRes.data : roomRes.data.data
      const tsData = Array.isArray(tsRes.data) ? tsRes.data : tsRes.data.data

      setSections(secData || [])
      setOfferings(offData || [])
      setRooms(roomData || [])
      setTimeslots(tsData || [])
    } catch (err) {
      console.error('Error al cargar datos:', err)
      alert('❌ Error al cargar los datos de secciones.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // 🔹 Guardar o actualizar sección
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.offeringId) return alert('⚠️ Seleccione un curso antes de continuar.')

    try {
      setLoading(true)
      if (editing) {
        await updateSection(editing.id, form)
        alert('✏️ Sección actualizada correctamente.')
      } else {
        await createSection(form)
        alert('✅ Sección creada exitosamente.')
      }

      setForm({
        offeringId: '',
        code: '',
        capacity: 0,
        assignedRoomId: '',
        assignedTimeslotId: '',
      })
      setEditing(null)
      setShowModal(false)
      loadData()
    } catch (err) {
      console.error('Error al guardar sección:', err)
      alert('❌ No se pudo guardar la sección.')
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Eliminar sección
  const handleDelete = async (id) => {
    if (!window.confirm('🗑️ ¿Eliminar esta sección?')) return
    try {
      await deleteSection(id)
      alert('🗑️ Sección eliminada correctamente.')
      loadData()
    } catch (err) {
      console.error('Error al eliminar sección:', err)
      alert('❌ No se pudo eliminar la sección.')
    }
  }

  // 🔹 Editar sección
  const handleEdit = (section) => {
    setForm({
      offeringId: section.offering?.id || '',
      code: section.code,
      capacity: section.capacity,
      assignedRoomId: section.assigned_room?.id || '',
      assignedTimeslotId: section.assigned_timeslot?.id || '',
    })
    setEditing(section)
    setShowModal(true)
  }

  // 🔹 Acciones de tabla
  const renderActions = (s) => (
    <div className="flex justify-center gap-3">
      <button
        onClick={() => handleEdit(s)}
        className="text-blue-600 hover:text-blue-800 transition"
        title="Editar sección"
      >
        <FaEdit size={16} />
      </button>
      <button
        onClick={() => handleDelete(s.id)}
        className="text-red-600 hover:text-red-800 transition"
        title="Eliminar sección"
      >
        <FaTrash size={16} />
      </button>
    </div>
  )

  return (
    <div className="p-6 animate-fadeIn">
      {/* Título */}
      <div className="flex justify-between items-center mb-6">
        <SectionTitle title="📚 Gestión de Secciones" />
        <Button
          onClick={() => {
            setShowModal(true)
            setEditing(null)
            setForm({
              offeringId: '',
              code: '',
              capacity: 0,
              assignedRoomId: '',
              assignedTimeslotId: '',
            })
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Nueva Sección
        </Button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="text-center py-8 text-gray-500 animate-pulse">
          Cargando secciones...
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm text-gray-500">
          No hay secciones registradas todavía.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <Table
            headers={[
              'Curso',
              'Código',
              'Capacidad',
              'Aula',
              'Horario',
              'Acciones',
            ]}
            data={sections.map((s) => [
              s.offering?.course?.name || '—',
              s.code,
              s.capacity,
              s.assigned_room ? (
                <div className="flex items-center gap-1 justify-center">
                  <FaDoorOpen className="text-blue-600" />
                  {s.assigned_room.name}
                </div>
              ) : (
                '—'
              ),
              s.assigned_timeslot ? (
                <div className="flex items-center gap-1 justify-center">
                  <FaClock className="text-gray-700" />
                  {`${s.assigned_timeslot.startTime || s.assigned_timeslot.start_time} - ${
                    s.assigned_timeslot.endTime || s.assigned_timeslot.end_time
                  }`}
                </div>
              ) : (
                '—'
              ),
              renderActions(s),
            ])}
          />
        </div>
      )}

      {/* Modal Crear / Editar */}
      <Modal
        open={showModal}
        title={editing ? 'Editar Sección' : 'Nueva Sección'}
        onClose={() => {
          setShowModal(false)
          setEditing(null)
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Curso */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Curso / Oferta
            </label>
            <select
              value={form.offeringId}
              onChange={(e) => setForm({ ...form, offeringId: e.target.value })}
              required
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
            >
              <option value="">Seleccione un curso</option>
              {offerings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.course?.name} ({o.semester?.name || 'Sin semestre'})
                </option>
              ))}
            </select>
          </div>

          {/* Código */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Código de la sección
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
              placeholder="Ej: A1, B2, etc."
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
            />
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Capacidad
            </label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: parseInt(e.target.value) })
              }
              min={1}
              required
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
            />
          </div>

          {/* Aula */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Aula
            </label>
            <select
              value={form.assignedRoomId}
              onChange={(e) =>
                setForm({ ...form, assignedRoomId: e.target.value })
              }
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
            >
              <option value="">
                {rooms.length ? 'Seleccione un aula' : 'No hay aulas registradas'}
              </option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (Capacidad: {r.capacity})
                </option>
              ))}
            </select>
          </div>

          {/* Horario */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Horario
            </label>
            <select
              value={form.assignedTimeslotId}
              onChange={(e) =>
                setForm({ ...form, assignedTimeslotId: e.target.value })
              }
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
            >
              <option value="">
                {timeslots.length
                  ? 'Seleccione un horario'
                  : 'No hay horarios disponibles'}
              </option>
              {timeslots.map((ts) => (
                <option key={ts.id} value={ts.id}>
                  {(ts.startTime || ts.start_time) +
                    ' - ' +
                    (ts.endTime || ts.end_time)}
                </option>
              ))}
            </select>
          </div>

          {/* Botón */}
          <Button
            type="submit"
            className={`w-full ${
              editing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
            } transition`}
          >
            {editing ? 'Actualizar Sección' : 'Guardar'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
