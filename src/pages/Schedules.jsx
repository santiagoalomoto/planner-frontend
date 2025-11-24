import React, { useState, useEffect } from 'react'
import api from '../api/axios'
import Button from '../components/Button'
import SectionTitle from '../components/SectionTitle'
import Card from '../components/Card'
import { Calendar } from 'lucide-react'

export default function Schedules() {
  const [roomSchedules, setRoomSchedules] = useState([])
  const [teacherSchedules, setTeacherSchedules] = useState([])
  const [form, setForm] = useState({
    roomId: '',
    teacherId: '',
    timeslotId: '',
    sectionId: '',
    semesterId: '',
  })

  const [rooms, setRooms] = useState([])
  const [teachers, setTeachers] = useState([])
  const [timeslots, setTimeslots] = useState([])
  const [sections, setSections] = useState([])
  const [semesters, setSemesters] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [roomSchedRes, teacherSchedRes, roomsRes, teachersRes, timesRes, sectRes, semRes] =
        await Promise.all([
          api.get('/schedules/rooms'),
          api.get('/schedules/teachers'),
          api.get('/rooms'),
          api.get('/teachers'),
          api.get('/timeslots'),
          api.get('/sections'),
          api.get('/semesters'),
        ])

      setRoomSchedules(roomSchedRes.data)
      setTeacherSchedules(teacherSchedRes.data)
      setRooms(roomsRes.data)
      setTeachers(teachersRes.data)
      setTimeslots(timesRes.data)
      setSections(sectRes.data)
      setSemesters(semRes.data)
    } catch (err) {
      console.error('❌ Error cargando datos:', err)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.roomId || !form.teacherId || !form.timeslotId || !form.sectionId || !form.semesterId)
      return alert('Completa todos los campos')

    try {
      // Guardar en ambos horarios (aula y docente)
      await Promise.all([
        api.post('/schedules/rooms', {
          roomId: form.roomId,
          timeslotId: form.timeslotId,
          sectionId: form.sectionId,
          semesterId: form.semesterId,
        }),
        api.post('/schedules/teachers', {
          teacherId: form.teacherId,
          timeslotId: form.timeslotId,
          sectionId: form.sectionId,
          semesterId: form.semesterId,
        }),
      ])
      setForm({
        roomId: '',
        teacherId: '',
        timeslotId: '',
        sectionId: '',
        semesterId: '',
      })
      fetchData()
    } catch (err) {
      console.error('❌ Error al crear horario:', err)
      alert(err.response?.data?.message || 'Error al crear horario')
    }
  }

  const handleDelete = async (id, type) => {
    if (!confirm('¿Eliminar este horario?')) return
    try {
      await api.delete(`/schedules/${type}/${id}`)
      fetchData()
    } catch (err) {
      console.error('❌ Error al eliminar horario:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6 space-y-6">
      <SectionTitle icon={Calendar} title="Gestión de Horarios" subtitle="Asigna aulas y docentes a horarios" />

      {/* Formulario */}
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
        <select name="roomId" value={form.roomId} onChange={handleChange} className="w-full md:flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          <option value="">Seleccionar aula</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <select name="teacherId" value={form.teacherId} onChange={handleChange} className="w-full md:flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          <option value="">Seleccionar docente</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select name="timeslotId" value={form.timeslotId} onChange={handleChange} className="w-full md:flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          <option value="">Seleccionar horario</option>
          {timeslots.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
        <select name="sectionId" value={form.sectionId} onChange={handleChange} className="w-full md:flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          <option value="">Seleccionar sección</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select name="semesterId" value={form.semesterId} onChange={handleChange} className="w-full md:flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          <option value="">Seleccionar semestre</option>
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <div className="flex items-center">
          <Button>Agregar</Button>
        </div>
        </form>
      </Card>

      {/* Tabla de Aulas */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">Horarios por Aula</h2>
        <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3 text-left text-sm text-slate-600">Aula</th>
              <th className="p-3 text-left text-sm text-slate-600">Sección</th>
              <th className="p-3 text-left text-sm text-slate-600">Horario</th>
              <th className="p-3 text-left text-sm text-slate-600">Semestre</th>
              <th className="p-3 text-left text-sm text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roomSchedules.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="border p-3 text-sm">{r.room?.name}</td>
                <td className="border p-3 text-sm">{r.section?.name}</td>
                <td className="border p-3 text-sm">{r.timeslot?.label}</td>
                <td className="border p-3 text-sm">{r.semester?.name}</td>
                <td className="border p-3 text-sm">
                  <button onClick={() => handleDelete(r.id, 'rooms')} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition-colors">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>

      {/* Tabla de Docentes */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">Horarios por Docente</h2>
        <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3 text-left text-sm text-slate-600">Docente</th>
              <th className="p-3 text-left text-sm text-slate-600">Sección</th>
              <th className="p-3 text-left text-sm text-slate-600">Horario</th>
              <th className="p-3 text-left text-sm text-slate-600">Semestre</th>
              <th className="p-3 text-left text-sm text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {teacherSchedules.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="border p-3 text-sm">{t.teacher?.name}</td>
                <td className="border p-3 text-sm">{t.section?.name}</td>
                <td className="border p-3 text-sm">{t.timeslot?.label}</td>
                <td className="border p-3 text-sm">{t.semester?.name}</td>
                <td className="border p-3 text-sm">
                  <button onClick={() => handleDelete(t.id, 'teachers')} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition-colors">
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
