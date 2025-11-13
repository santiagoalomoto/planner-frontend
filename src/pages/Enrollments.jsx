import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'
import SectionTitle from '../components/SectionTitle'

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [students, setStudents] = useState([])
  const [offerings, setOfferings] = useState([])
  const [sections, setSections] = useState([])
  const [filteredSections, setFilteredSections] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])

  const [form, setForm] = useState({ studentId: '', offeringId: '', sectionId: '' })
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  // 🔹 Cargar datos iniciales
  const fetchData = async () => {
    setLoading(true)
    try {
      const [enrRes, stuRes, offRes, secRes] = await Promise.all([
        api.get('/enrollments'),
        api.get('/students'),
        api.get('/offerings'),
        api.get('/sections'),
      ])
      setEnrollments(enrRes.data)
      setStudents(stuRes.data)
      setOfferings(offRes.data)
      setSections(secRes.data)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError('No se pudieron cargar los datos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 🔹 Manejo de cambio en selects
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    if (name === 'offeringId') {
      const filteredSec = sections
        .map((s) => {
          const maxCap = s.assigned_room?.capacity ?? s.capacity ?? 0
          const currentEnrollments = enrollments.filter((enr) => enr.section?.id === s.id).length
          const remainingSeats = maxCap - currentEnrollments
          return { ...s, remainingSeats }
        })
        .filter((s) => s.offering?.id === value && s.remainingSeats > 0)

      setFilteredSections(filteredSec)
      setForm((prev) => ({ ...prev, sectionId: '' }))

      const enrolledStudentIds = enrollments
        .filter((enr) => enr.offering?.id === value)
        .map((enr) => enr.student?.id)

      const filteredStu = students.filter((s) => !enrolledStudentIds.includes(s.id))
      setFilteredStudents(filteredStu)
      setForm((prev) => ({ ...prev, studentId: '' }))
    }
  }

  // 🔹 Guardar o actualizar inscripción
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.studentId || !form.offeringId || !form.sectionId) {
      setError('⚠️ Debes seleccionar estudiante, oferta y sección.')
      return
    }

    try {
      if (editing) {
        await api.patch(`/enrollments/${editing.id}`, form)
        alert('✏️ Inscripción actualizada correctamente.')
      } else {
        await api.post('/enrollments', form)
        alert('✅ Inscripción creada exitosamente.')
      }
      setForm({ studentId: '', offeringId: '', sectionId: '' })
      setEditing(null)
      setFilteredSections([])
      setFilteredStudents([])
      setShowModal(false)
      fetchData()
    } catch (err) {
      console.error('Error al guardar:', err)
      let msg = '❌ Error desconocido al guardar.'
      if (err.response?.data?.message) msg = err.response.data.message
      setError(msg)
    }
  }

  // 🔹 Editar
  const handleEdit = (enrollment) => {
    setEditing(enrollment)
    setForm({
      studentId: enrollment.student?.id || '',
      offeringId: enrollment.offering?.id || '',
      sectionId: enrollment.section?.id || '',
    })
    setShowModal(true)
  }

  // 🔹 Eliminar
  const handleDelete = async (id) => {
    if (!window.confirm('🗑️ ¿Eliminar inscripción?')) return
    try {
      await api.delete(`/enrollments/${id}`)
      alert('🗑️ Inscripción eliminada correctamente.')
      fetchData()
    } catch (err) {
      console.error('Error al eliminar:', err)
      setError('❌ No se pudo eliminar la inscripción.')
    }
  }

  // 🔹 Estado visual
  const renderStatus = (status) => {
    const base = 'px-3 py-1 rounded-full text-xs font-semibold'
    switch (status) {
      case 'active':
        return <span className={`${base} bg-green-100 text-green-700`}>Activa</span>
      case 'inactive':
        return <span className={`${base} bg-red-100 text-red-700`}>Inactiva</span>
      default:
        return <span className={`${base} bg-gray-200 text-gray-700`}>{status}</span>
    }
  }

  // 🔹 Acciones
  const renderActions = (enr) => (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => handleEdit(enr)}
        className="text-blue-600 hover:text-blue-800 transition"
        title="Editar inscripción"
      >
        ✏️
      </button>
      <button
        onClick={() => handleDelete(enr.id)}
        className="text-red-600 hover:text-red-800 transition"
        title="Eliminar inscripción"
      >
        🗑
      </button>
    </div>
  )

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <SectionTitle title="🎓 Gestión de Inscripciones" />
        <Button
          onClick={() => {
            setShowModal(true)
            setEditing(null)
            setForm({ studentId: '', offeringId: '', sectionId: '' })
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Nueva Inscripción
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500 animate-pulse">
          Cargando inscripciones...
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm text-gray-500">
          No hay inscripciones registradas todavía.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <Table
            headers={['Estudiante', 'Curso', 'Sección', 'Estado', 'Acciones']}
            data={enrollments.map((e) => [
              e.student?.name || '—',
              e.offering?.course?.name || '—',
              e.section?.code || '—',
              renderStatus(e.status || 'active'),
              renderActions(e),
            ])}
          />
        </div>
      )}

      {/* 🔹 Modal Crear/Editar */}
      <Modal
        open={showModal}
        title={editing ? 'Editar Inscripción' : 'Nueva Inscripción'}
        onClose={() => {
          setShowModal(false)
          setEditing(null)
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Oferta */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Oferta</label>
            <select
              name="offeringId"
              value={form.offeringId}
              onChange={handleChange}
              required
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
            >
              <option value="">Seleccione una oferta</option>
              {offerings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.course?.name || `Oferta ${o.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Estudiante */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Estudiante</label>
            <select
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              required
              disabled={!form.offeringId || filteredStudents.length === 0}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
            >
              <option value="">
                {filteredStudents.length === 0
                  ? 'No hay estudiantes disponibles'
                  : 'Seleccione un estudiante'}
              </option>
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sección */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Sección</label>
            <select
              name="sectionId"
              value={form.sectionId}
              onChange={handleChange}
              required
              disabled={!form.offeringId || filteredSections.length === 0}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
            >
              <option value="">
                {filteredSections.length === 0
                  ? 'No hay secciones disponibles'
                  : 'Seleccione una sección'}
              </option>
              {filteredSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} (Cupos restantes: {s.remainingSeats})
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <Button
            type="submit"
            className={`w-full ${
              editing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
            } transition`}
          >
            {editing ? 'Actualizar' : 'Guardar'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
