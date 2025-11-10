import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'
import SectionTitle from '../components/SectionTitle'

export default function Offerings() {
  const [offerings, setOfferings] = useState([])
  const [courses, setCourses] = useState([])
  const [semesters, setSemesters] = useState([])
  const [teachers, setTeachers] = useState([])

  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const [form, setForm] = useState({
    courseId: '',
    semesterId: '',
    teacherId: '',
    expected_students: '',
  })

  // 🔹 Cargar datos
  const fetchData = async () => {
    setLoading(true)
    try {
      const [offeringsRes, coursesRes, semestersRes, teachersRes] = await Promise.all([
        api.get('/offerings'),
        api.get('/courses'),
        api.get('/semesters'),
        api.get('/teachers'),
      ])
      setOfferings(offeringsRes.data)
      setCourses(coursesRes.data)
      setSemesters(semestersRes.data)
      setTeachers(teachersRes.data)
    } catch (err) {
      console.error('Error cargando datos:', err)
      alert('❌ No se pudieron cargar las ofertas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 🔹 Validación
  const validateForm = () => {
    if (!form.courseId.trim() || !form.semesterId.trim()) {
      alert('⚠️ Los campos de curso y semestre son obligatorios.')
      return false
    }
    if (form.expected_students && isNaN(form.expected_students)) {
      alert('⚠️ El número de estudiantes esperados debe ser un número.')
      return false
    }
    return true
  }

  // 🔹 Guardar (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const payload = {
      courseId: form.courseId,
      semesterId: form.semesterId,
      teacherId: form.teacherId || null,
      expected_students: Number(form.expected_students) || 0,
    }

    try {
      if (editing) {
        await api.patch(`/offerings/${editing.id}`, payload)
        alert('✏️ Oferta actualizada correctamente.')
      } else {
        await api.post('/offerings', payload)
        alert('✅ Oferta creada exitosamente.')
      }
      setShowModal(false)
      setEditing(null)
      setForm({ courseId: '', semesterId: '', teacherId: '', expected_students: '' })
      fetchData()
    } catch (err) {
      console.error('Error al guardar oferta:', err)
      alert('❌ No se pudo guardar la oferta.')
    }
  }

  // 🔹 Editar
  const handleEdit = (off) => {
    setEditing(off)
    setForm({
      courseId: off.course?.id || '',
      semesterId: off.semester?.id || '',
      teacherId: off.teacher?.id || '',
      expected_students: off.expected_students || '',
    })
    setShowModal(true)
  }

  // 🔹 Eliminar
  const handleDelete = async (id) => {
    if (!window.confirm('🗑️ ¿Seguro que deseas eliminar esta oferta?')) return
    try {
      await api.delete(`/offerings/${id}`)
      alert('🗑️ Oferta eliminada correctamente.')
      fetchData()
    } catch (err) {
      console.error('Error al eliminar oferta:', err)
      alert('❌ No se pudo eliminar la oferta.')
    }
  }

  // 🔹 Estado visual
  const renderStatus = (status) => {
    const base = 'px-3 py-1 rounded-full text-xs font-semibold'
    switch (status) {
      case 'active':
        return <span className={`${base} bg-green-100 text-green-700`}>Activo</span>
      case 'inactive':
        return <span className={`${base} bg-red-100 text-red-700`}>Inactivo</span>
      default:
        return <span className={`${base} bg-gray-200 text-gray-700`}>{status}</span>
    }
  }

  // 🔹 Acciones
  const renderActions = (off) => (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => handleEdit(off)}
        className="text-blue-600 hover:text-blue-800 transition"
        title="Editar"
      >
        ✏️
      </button>
      <button
        onClick={() => handleDelete(off.id)}
        className="text-red-600 hover:text-red-800 transition"
        title="Eliminar"
      >
        🗑
      </button>
    </div>
  )

  // 🔹 Manejar cambios
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <SectionTitle title="📘 Gestión de Ofertas de Curso" />
        <Button
          onClick={() => {
            setShowModal(true)
            setEditing(null)
            setForm({ courseId: '', semesterId: '', teacherId: '', expected_students: '' })
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Nueva Oferta
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500 animate-pulse">
          Cargando ofertas...
        </div>
      ) : offerings.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm text-gray-500">
          No hay ofertas registradas todavía.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <Table
            headers={['Curso', 'Semestre', 'Docente', 'Estudiantes', 'Estado', 'Acciones']}
            data={offerings.map((o) => [
              o.course?.name || '-',
              o.semester?.name || '-',
              o.teacher?.name || '(Sin asignar)',
              o.expected_students || 0,
              renderStatus(o.status || 'active'),
              renderActions(o),
            ])}
          />
        </div>
      )}

      {/* 🔹 Modal Crear/Editar */}
      <Modal
        open={showModal}
        title={editing ? 'Editar Oferta' : 'Nueva Oferta'}
        onClose={() => {
          setShowModal(false)
          setEditing(null)
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Curso */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Curso
            </label>
            <select
              name="courseId"
              value={form.courseId}
              onChange={handleChange}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              required
            >
              <option value="">Seleccione un curso</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semestre */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Semestre
            </label>
            <select
              name="semesterId"
              value={form.semesterId}
              onChange={handleChange}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              required
            >
              <option value="">Seleccione un semestre</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Docente */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Docente (opcional)
            </label>
            <select
              name="teacherId"
              value={form.teacherId}
              onChange={handleChange}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
            >
              <option value="">(Sin asignar)</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Estudiantes esperados */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Estudiantes esperados
            </label>
            <input
              type="number"
              name="expected_students"
              value={form.expected_students}
              onChange={handleChange}
              min="0"
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              placeholder="Ej: 25"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition"
          >
            {editing ? 'Actualizar' : 'Guardar'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
