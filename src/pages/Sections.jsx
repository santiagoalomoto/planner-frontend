import React, { useEffect, useState } from 'react'
import { getSections, createSection, updateSection, deleteSection } from '../api/sections'
import { getOfferings } from '../api/offerings'
import { getRooms } from '../api/rooms'
import { getTimeslots } from '../api/timeslots'

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
    assignedTimeslotId: ''
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [secRes, offRes, roomRes, tsRes] = await Promise.all([
      getSections(),
      getOfferings(),
      getRooms(),
      getTimeslots()
    ])
    setSections(secRes.data)
    setOfferings(offRes.data)
    setRooms(roomRes.data)
    setTimeslots(tsRes.data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.offeringId) return alert('Seleccione un curso')
    try {
      if (editingId) {
        await updateSection(editingId, form)
        setEditingId(null)
      } else {
        await createSection(form)
      }

      setForm({
        offeringId: '',
        code: '',
        capacity: 0,
        assignedRoomId: '',
        assignedTimeslotId: ''
      })
      loadData()
    } catch (err) {
      console.error('Error al guardar sección:', err)
      alert(err.response?.data?.message || 'Error desconocido')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta sección?')) return
    try {
      await deleteSection(id)
      loadData()
    } catch (err) {
      console.error('Error al eliminar sección:', err)
      alert('No se pudo eliminar la sección')
    }
  }

  const handleEdit = (section) => {
    setForm({
      offeringId: section.offering?.id || '',
      code: section.code,
      capacity: section.capacity,
      assignedRoomId: section.assigned_room?.id || '',
      assignedTimeslotId: section.assigned_timeslot?.id || ''
    })
    setEditingId(section.id)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📚 Secciones</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <select
          value={form.offeringId}
          onChange={(e) => setForm({ ...form, offeringId: e.target.value })}
          className="border px-3 py-1 rounded w-full"
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
          className="border px-3 py-1 rounded w-full"
          required
        />

        <input
          type="number"
          placeholder="Capacidad"
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })}
          className="border px-3 py-1 rounded w-full"
          min={1}
          required
        />

        <select
          value={form.assignedRoomId}
          onChange={(e) => setForm({ ...form, assignedRoomId: e.target.value })}
          className="border px-3 py-1 rounded w-full"
        >
          <option value="">-- Seleccione un aula --</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} (Capacidad: {r.capacity})
            </option>
          ))}
        </select>

        <select
          value={form.assignedTimeslotId}
          onChange={(e) => setForm({ ...form, assignedTimeslotId: e.target.value })}
          className="border px-3 py-1 rounded w-full"
        >
          <option value="">-- Seleccione un horario --</option>
          {timeslots.map((ts) => (
            <option key={ts.id} value={ts.id}>
              {ts.startTime} - {ts.endTime}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editingId ? 'Actualizar Sección' : 'Agregar Sección'}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setForm({ offeringId: '', code: '', capacity: 0, assignedRoomId: '', assignedTimeslotId: '' })
              setEditingId(null)
            }}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        )}
      </form>

      {/* Tabla */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Curso</th>
            <th className="p-2 border">Código</th>
            <th className="p-2 border">Capacidad</th>
            <th className="p-2 border">Aula</th>
            <th className="p-2 border">Horario</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((s) => (
            <tr key={s.id}>
              <td className="border p-2">{s.offering?.course?.name || '—'}</td>
              <td className="border p-2">{s.code}</td>
              <td className="border p-2">{s.capacity}</td>
              <td className="border p-2">{s.assigned_room?.name || '—'}</td>
              <td className="border p-2">
                {s.assigned_timeslot
                  ? `${s.assigned_timeslot.startTime} - ${s.assigned_timeslot.endTime}`
                  : '—'}
              </td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => handleEdit(s)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
