import React, { useState, useEffect } from 'react'
import api from '../api/axios'
import Button from '../components/Button'
import Table from '../components/Table'
import SectionTitle from '../components/SectionTitle'
import Modal from '../components/Modal'

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

  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingType, setEditingType] = useState(null) // 'rooms' o 'teachers'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
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
      alert('No se pudieron cargar los horarios.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // 🔹 Crear o actualizar horario
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (
      !form.roomId ||
      !form.teacherId ||
      !form.timeslotId ||
      !form.sectionId ||
      !form.semesterId
    ) {
      alert('⚠️ Completa todos los campos antes de guardar.')
      return
    }

    try {
      if (editingId) {
        // 🔄 Actualizar horario
        await Promise.all([
          api.patch(`/schedules/rooms/${editingId}`, {
            roomId: form.roomId,
            timeslotId: form.timeslotId,
            sectionId: form.sectionId,
            semesterId: form.semesterId,
          }),
          api.patch(`/schedules/teachers/${editingId}`, {
            teacherId: form.teacherId,
            timeslotId: form.timeslotId,
            sectionId: form.sectionId,
            semesterId: form.semesterId,
          }),
        ])
        alert('✅ Horario actualizado correctamente.')
      } else {
        // ➕ Crear nuevo horario
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
        alert('✅ Horario agregado correctamente.')
      }

      setForm({
        roomId: '',
        teacherId: '',
        timeslotId: '',
        sectionId: '',
        semesterId: '',
      })
      setEditingId(null)
      setShowModal(false)
      fetchData()
    } catch (err) {
      console.error('❌ Error al guardar horario:', err)
      alert(err.response?.data?.message || 'Error al guardar horario')
    }
  }

  const handleDelete = async (id, type) => {
    if (!window.confirm('🗑️ ¿Eliminar este horario?')) return
    try {
      await api.delete(`/schedules/${type}/${id}`)
      fetchData()
    } catch (err) {
      console.error('❌ Error al eliminar horario:', err)
      alert('No se pudo eliminar el horario.')
    }
  }

  // ✏️ Editar horario
  const handleEdit = (schedule, type) => {
    setEditingId(schedule.id)
    setEditingType(type)
    setForm({
      roomId: schedule.room?.id || '',
      teacherId: schedule.teacher?.id || '',
      timeslotId: schedule.timeslot?.id || '',
      sectionId: schedule.section?.id || '',
      semesterId: schedule.semester?.id || '',
    })
    setShowModal(true)
  }

  return (
    <div className="p-6 animate-fadeIn">
      {/* 🔹 Título y botón */}
      <div className="flex justify-between items-center mb-6">
        <SectionTitle title="🕒 Gestión de Horarios" />
        <Button
          onClick={() => {
            setEditingId(null)
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Nuevo Horario
        </Button>
      </div>

      {/* 🔹 Tabla de Aulas */}
      <div className="bg-white shadow rounded-xl p-5 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Horarios por Aula
        </h2>
        {loading ? (
          <div className="text-center py-6 text-gray-500">Cargando...</div>
        ) : roomSchedules.length === 0 ? (
          <div className="text-center py-6 text-gray-500 italic">
            No hay horarios por aula registrados.
          </div>
        ) : (
          <Table
            headers={['Aula', 'Sección', 'Horario', 'Semestre', 'Acciones']}
            data={roomSchedules.map((r) => [
              r.room?.name || '—',
              r.section?.code || '—',
              r.timeslot
                ? `Día ${r.timeslot.day_of_week} | ${r.timeslot.start_time} - ${r.timeslot.end_time}`
                : '—',
              r.semester?.name || '—',
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleEdit(r, 'rooms')}
                  className="text-blue-600 hover:text-blue-800 transition"
                  title="Editar horario"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(r.id, 'rooms')}
                  className="text-red-600 hover:text-red-800 transition"
                  title="Eliminar horario"
                >
                  🗑
                </button>
              </div>,
            ])}
          />
        )}
      </div>

      {/* 🔹 Tabla de Docentes */}
      <div className="bg-white shadow rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Horarios por Docente
        </h2>
        {loading ? (
          <div className="text-center py-6 text-gray-500">Cargando...</div>
        ) : teacherSchedules.length === 0 ? (
          <div className="text-center py-6 text-gray-500 italic">
            No hay horarios por docente registrados.
          </div>
        ) : (
          <Table
            headers={['Docente', 'Sección', 'Horario', 'Semestre', 'Acciones']}
            data={teacherSchedules.map((t) => [
              t.teacher?.name || '—',
              t.section?.code || '—',
              t.timeslot
                ? `Día ${t.timeslot.day_of_week} | ${t.timeslot.start_time} - ${t.timeslot.end_time}`
                : '—',
              t.semester?.name || '—',
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleEdit(t, 'teachers')}
                  className="text-blue-600 hover:text-blue-800 transition"
                  title="Editar horario"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(t.id, 'teachers')}
                  className="text-red-600 hover:text-red-800 transition"
                  title="Eliminar horario"
                >
                  🗑
                </button>
              </div>,
            ])}
          />
        )}
      </div>

      {/* 🔹 Modal de creación / edición */}
      <Modal
        open={showModal}
        title={editingId ? 'Editar Horario' : 'Agregar nuevo horario'}
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selects */}
          {[
            { label: 'Aula', name: 'roomId', options: rooms, field: 'name' },
            { label: 'Docente', name: 'teacherId', options: teachers, field: 'name' },
            { label: 'Horario', name: 'timeslotId', options: timeslots, field: null },
            { label: 'Sección', name: 'sectionId', options: sections, field: 'code' },
            { label: 'Semestre', name: 'semesterId', options: semesters, field: 'name' },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {f.label}
              </label>
              <select
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                className="w-full border p-2 rounded-md focus:ring focus:ring-blue-100"
              >
                <option value="">Seleccionar {f.label.toLowerCase()}</option>
                {f.options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {f.field
                      ? opt[f.field]
                      : `Día ${opt.day_of_week} | ${opt.start_time} - ${opt.end_time}`}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition"
          >
            {editingId ? 'Actualizar Horario' : 'Guardar Horario'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
