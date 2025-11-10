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
import { motion } from 'framer-motion'
import { FaEdit, FaTrash, FaDoorOpen, FaClock, FaBook } from 'react-icons/fa'

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
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

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

      console.log('📅 Timeslots cargados:', tsData)

      setSections(secData || [])
      setOfferings(offData || [])
      setRooms(roomData || [])
      setTimeslots(tsData || [])
    } catch (err) {
      console.error('Error al cargar datos:', err)
      showMessage('❌ Error al cargar datos del sistema', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.offeringId) return showMessage('Seleccione un curso', 'error')

    try {
      setLoading(true)
      if (editingId) {
        await updateSection(editingId, form)
        showMessage('✅ Sección actualizada correctamente')
      } else {
        await createSection(form)
        showMessage('✅ Sección creada exitosamente')
      }

      setForm({
        offeringId: '',
        code: '',
        capacity: 0,
        assignedRoomId: '',
        assignedTimeslotId: '',
      })
      setEditingId(null)
      loadData()
    } catch (err) {
      console.error('Error al guardar sección:', err)
      showMessage(err.response?.data?.message || 'Error desconocido', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta sección?')) return
    try {
      await deleteSection(id)
      loadData()
      showMessage('🗑️ Sección eliminada correctamente')
    } catch (err) {
      console.error('Error al eliminar sección:', err)
      showMessage('❌ No se pudo eliminar la sección', 'error')
    }
  }

  const handleEdit = (section) => {
    setForm({
      offeringId: section.offering?.id || '',
      code: section.code,
      capacity: section.capacity,
      assignedRoomId: section.assigned_room?.id || '',
      assignedTimeslotId: section.assigned_timeslot?.id || '',
    })
    setEditingId(section.id)
  }

  return (
    <div className="p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-2"
      >
        <FaBook /> Gestión de Secciones
      </motion.h1>

      {/* Mensaje temporal */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-md text-white ${
            message.type === 'error' ? 'bg-red-500' : 'bg-green-600'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Formulario */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 bg-gray-50 p-6 rounded-xl shadow-md"
      >
        <select
          value={form.offeringId}
          onChange={(e) => setForm({ ...form, offeringId: e.target.value })}
          className="border p-2 rounded w-full"
          required
        >
          <option value="">-- Seleccione un curso --</option>
          {offerings.map((o) => (
            <option key={o.id} value={o.id}>
              {o.course?.name} ({o.semester?.name || 'Sin semestre'})
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Código de la sección"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />

        <input
          type="number"
          placeholder="Capacidad"
          value={form.capacity}
          onChange={(e) =>
            setForm({ ...form, capacity: parseInt(e.target.value) })
          }
          className="border p-2 rounded w-full"
          min={1}
          required
        />

        {/* Aula */}
        <select
          value={form.assignedRoomId}
          onChange={(e) =>
            setForm({ ...form, assignedRoomId: e.target.value })
          }
          className={`border p-2 rounded w-full ${
            !rooms.length ? 'bg-gray-100 text-gray-400' : ''
          }`}
        >
          <option value="">
            {rooms.length ? '-- Seleccione un aula --' : 'No hay aulas registradas'}
          </option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} (Capacidad: {r.capacity})
            </option>
          ))}
        </select>

        {/* Horario */}
        <select
          value={form.assignedTimeslotId}
          onChange={(e) =>
            setForm({ ...form, assignedTimeslotId: e.target.value })
          }
          className={`border p-2 rounded w-full ${
            !timeslots.length ? 'bg-gray-100 text-gray-400' : ''
          }`}
        >
          <option value="">
            {timeslots.length
              ? '-- Seleccione un horario --'
              : 'No hay horarios disponibles'}
          </option>
          {timeslots.map((ts) => (
            <option key={ts.id} value={ts.id}>
              {(ts.startTime || ts.start_time || '??')} -{' '}
              {(ts.endTime || ts.end_time || '??')}
            </option>
          ))}
        </select>

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all"
          >
            {editingId ? 'Actualizar Sección' : 'Agregar Sección'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm({
                  offeringId: '',
                  code: '',
                  capacity: 0,
                  assignedRoomId: '',
                  assignedTimeslotId: '',
                })
                setEditingId(null)
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          )}
        </div>
      </motion.form>

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-x-auto"
      >
        <table className="w-full border-collapse shadow-md">
          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="p-3 border">Curso</th>
              <th className="p-3 border">Código</th>
              <th className="p-3 border">Capacidad</th>
              <th className="p-3 border">Aula</th>
              <th className="p-3 border">Horario</th>
              <th className="p-3 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sections.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 p-4 italic">
                  No hay secciones registradas.
                </td>
              </tr>
            )}
            {sections.map((s, idx) => (
              <motion.tr
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-gray-50 transition"
              >
                <td className="border p-2">{s.offering?.course?.name || '—'}</td>
                <td className="border p-2">{s.code}</td>
                <td className="border p-2 text-center">{s.capacity}</td>
                <td className="border p-2 flex items-center gap-1 justify-center">
                  <FaDoorOpen className="text-blue-600" />
                  {s.assigned_room?.name || '—'}
                </td>
                <td className="border p-2 flex items-center gap-1 justify-center">
                  <FaClock className="text-gray-700" />
                  {s.assigned_timeslot
                    ? `${s.assigned_timeslot.startTime || s.assigned_timeslot.start_time} - ${
                        s.assigned_timeslot.endTime || s.assigned_timeslot.end_time
                      }`
                    : '—'}
                </td>

                {/* 🔹 Botones de acción con estilo similar a Courses */}
                <td className="border p-2 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(s)}
                      className="text-blue-600 hover:text-blue-800 transition transform hover:scale-110"
                      title="Editar sección"
                    >
                      <FaEdit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(s.id)}
                      className="bg-gray-100 text-gray-600 hover:bg-gray-300 hover:text-gray-800 p-2 rounded-lg transition transform hover:scale-105 shadow-sm"
                      title="Eliminar sección"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
