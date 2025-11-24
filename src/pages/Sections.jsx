import React, { useEffect, useState } from 'react'
import { getSections, createSection, updateSection, deleteSection } from '../api/sections'
import { getOfferings } from '../api/offerings'
import { getRooms } from '../api/rooms'
import { getTimeslots } from '../api/timeslots'
import SectionTitle from '../components/SectionTitle'
import Card from '../components/Card'
import Button from '../components/Button'
import { BookOpen } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6 space-y-6">
      <SectionTitle icon={BookOpen} title="Secciones" subtitle="Administra las secciones por oferta" />

      <Card>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={form.offeringId}
            onChange={(e) => setForm({ ...form, offeringId: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />

          <input
            type="number"
            placeholder="Capacidad"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            min={1}
            required
          />

          <select
            value={form.assignedRoomId}
            onChange={(e) => setForm({ ...form, assignedRoomId: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">-- Seleccione un horario --</option>
            {timeslots.map((ts) => (
              <option key={ts.id} value={ts.id}>
                {ts.startTime} - {ts.endTime}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-3">
            <Button onClick={() => {}} className="hidden" />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
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
                className="ml-2 bg-gray-200 text-slate-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-all"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-3 text-left text-sm text-slate-600">Curso</th>
                <th className="p-3 text-left text-sm text-slate-600">Código</th>
                <th className="p-3 text-left text-sm text-slate-600">Capacidad</th>
                <th className="p-3 text-left text-sm text-slate-600">Aula</th>
                <th className="p-3 text-left text-sm text-slate-600">Horario</th>
                <th className="p-3 text-left text-sm text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="border p-3 text-sm">{s.offering?.course?.name || '—'}</td>
                  <td className="border p-3 text-sm">{s.code}</td>
                  <td className="border p-3 text-sm">{s.capacity}</td>
                  <td className="border p-3 text-sm">{s.assigned_room?.name || '—'}</td>
                  <td className="border p-3 text-sm">
                    {s.assigned_timeslot
                      ? `${s.assigned_timeslot.startTime} - ${s.assigned_timeslot.endTime}`
                      : '—'}
                  </td>
                  <td className="border p-3 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
