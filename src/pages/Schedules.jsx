import React, { useState, useEffect } from 'react'
import api from '../api/axios'
import Button from '../components/Button'

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
      const [
        roomSchedRes,
        teacherSchedRes,
        roomsRes,
        teachersRes,
        timesRes,
        sectRes,
        semRes,
      ] = await Promise.all([
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
    if (
      !form.roomId ||
      !form.teacherId ||
      !form.timeslotId ||
      !form.sectionId ||
      !form.semesterId
    )
      return alert('Completa todos los campos')

    try {
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
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Gestión de Horarios</h1>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow p-4 rounded mb-6 flex flex-wrap gap-3"
      >
        {/* Aula */}
        <select
          name="roomId"
          value={form.roomId}
          onChange={handleChange}
          className="border p-2 rounded flex-1"
        >
          <option value="">Seleccionar aula</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        {/* Docente */}
        <select
          name="teacherId"
          value={form.teacherId}
          onChange={handleChange}
          className="border p-2 rounded flex-1"
        >
          <option value="">Seleccionar docente</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Horario */}
        <select
          name="timeslotId"
          value={form.timeslotId}
          onChange={handleChange}
          className="border p-2 rounded flex-1"
        >
          <option value="">Seleccionar horario</option>
          {timeslots.map((t) => (
            <option key={t.id} value={t.id}>
              {`Día ${t.day_of_week} | ${t.start_time} - ${t.end_time}`}
            </option>
          ))}
        </select>

        {/* Sección */}
        <select
          name="sectionId"
          value={form.sectionId}
          onChange={handleChange}
          className="border p-2 rounded flex-1"
        >
          <option value="">Seleccionar sección</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code}
            </option>
          ))}
        </select>

        {/* Semestre */}
        <select
          name="semesterId"
          value={form.semesterId}
          onChange={handleChange}
          className="border p-2 rounded flex-1"
        >
          <option value="">Seleccionar semestre</option>
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <Button>Agregar</Button>
      </form>

      {/* Tabla de Aulas */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Horarios por Aula</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Aula</th>
              <th className="border p-2 text-left">Sección</th>
              <th className="border p-2 text-left">Horario</th>
              <th className="border p-2 text-left">Semestre</th>
              <th className="border p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roomSchedules.map((r) => (
              <tr key={r.id}>
                <td className="border p-2">{r.room?.name}</td>
                <td className="border p-2">{r.section?.code}</td>
                <td className="border p-2">
                  {r.timeslot
                    ? `Día ${r.timeslot.day_of_week} | ${r.timeslot.start_time} - ${r.timeslot.end_time}`
                    : ''}
                </td>
                <td className="border p-2">{r.semester?.name}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDelete(r.id, 'rooms')}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabla de Docentes */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Horarios por Docente</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Docente</th>
              <th className="border p-2 text-left">Sección</th>
              <th className="border p-2 text-left">Horario</th>
              <th className="border p-2 text-left">Semestre</th>
              <th className="border p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {teacherSchedules.map((t) => (
              <tr key={t.id}>
                <td className="border p-2">{t.teacher?.name}</td>
                <td className="border p-2">{t.section?.code}</td>
                <td className="border p-2">
                  {t.timeslot
                    ? `Día ${t.timeslot.day_of_week} | ${t.timeslot.start_time} - ${t.timeslot.end_time}`
                    : ''}
                </td>
                <td className="border p-2">{t.semester?.name}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDelete(t.id, 'teachers')}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
