import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'
import SectionTitle from '../components/SectionTitle'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const [form, setForm] = useState({
    code: '',
    name: '',
    career: '',
    credit_hours: 3,
    requires_room_type: '',
    preferred_section_size: 30,
  })

  // 🔹 Cargar cursos
  const fetchCourses = async () => {
    setLoading(true)
    try {
      const res = await api.get('/courses')
      setCourses(res.data || [])
    } catch (err) {
      console.error('Error al obtener cursos:', err)
      alert('❌ No se pudieron cargar los cursos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  // 🔹 Validar campos
  const validateForm = () => {
    if (!form.name.trim()) {
      alert('⚠️ El nombre del curso es obligatorio.')
      return false
    }
    if (isNaN(form.credit_hours) || form.credit_hours <= 0) {
      alert('⚠️ Las horas crédito deben ser mayores a 0.')
      return false
    }
    if (isNaN(form.preferred_section_size) || form.preferred_section_size < 5) {
      alert('⚠️ El tamaño de sección debe ser al menos 5.')
      return false
    }
    return true
  }

  // 🔹 Crear o actualizar curso
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const data = {
      code: form.code || form.name.trim().toUpperCase().slice(0, 6),
      name: form.name.trim(),
      career: form.career.trim() || 'General',
      credit_hours: form.credit_hours,
      requires_room_type: form.requires_room_type.trim() || 'Aula estándar',
      preferred_section_size: form.preferred_section_size,
    }

    try {
      if (editing) {
        const id = editing.id ?? editing._id ?? editing.uuid
        await api.patch(`/courses/${id}`, data)
        alert('✏️ Curso actualizado correctamente.')
      } else {
        await api.post('/courses', data)
        alert('✅ Curso creado exitosamente.')
      }
      setShowModal(false)
      setEditing(null)
      setForm({
        code: '',
        name: '',
        career: '',
        credit_hours: 3,
        requires_room_type: '',
        preferred_section_size: 30,
      })
      fetchCourses()
    } catch (err) {
      console.error('Error al guardar curso:', err)
      const msg = err.response?.data?.message || err.message || 'Error desconocido'
      alert(`❌ No se pudo guardar el curso. ${msg}`)
    }
  }

  // 🔹 Editar curso
  const handleEdit = (course) => {
    setEditing(course)
    setForm({
      code: course.code || '',
      name: course.name || '',
      career: course.career || '',
      credit_hours: course.credit_hours || 3,
      requires_room_type: course.requires_room_type || '',
      preferred_section_size: course.preferred_section_size || 30,
    })
    setShowModal(true)
  }

  // 🔹 Eliminar curso
  const handleDelete = async (course) => {
    const id = course.id ?? course._id ?? course.uuid
    if (!window.confirm('🗑️ ¿Seguro que deseas eliminar este curso?')) return
    try {
      await api.delete(`/courses/${id}`)
      alert('🗑️ Curso eliminado correctamente.')
      fetchCourses()
    } catch (err) {
      console.error('Error al eliminar curso:', err)
      const msg = err.response?.data?.message || err.message || 'Error desconocido'
      alert(`❌ No se pudo eliminar el curso. ${msg}`)
    }
  }

  // 🔹 Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  // 🔹 Renderizar acciones por fila
  const renderActions = (course) => (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => handleEdit(course)}
        className="text-blue-600 hover:text-blue-800 transition"
        title="Editar curso"
      >
        ✏️
      </button>
      <button
        onClick={() => handleDelete(course)}
        className="text-red-600 hover:text-red-800 transition"
        title="Eliminar curso"
      >
        🗑
      </button>
    </div>
  )

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <SectionTitle title="📘 Gestión de Cursos" />
        <Button
          onClick={() => {
            setShowModal(true)
            setEditing(null)
            setForm({
              code: '',
              name: '',
              career: '',
              credit_hours: 3,
              requires_room_type: '',
              preferred_section_size: 30,
            })
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Nuevo Curso
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500 animate-pulse">Cargando cursos...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm text-gray-500">
          No hay cursos registrados todavía.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <Table
            headers={[
              'Código',
              'Nombre',
              'Carrera',
              'Créditos',
              'Sección Preferida',
              'Tipo de Aula',
              'Acciones',
            ]}
            data={courses.map((c) => [
              c.code || '—',
              c.name,
              c.career || '—',
              c.credit_hours || '—',
              c.preferred_section_size || '—',
              c.requires_room_type || '—',
              renderActions(c),
            ])}
          />
        </div>
      )}

      {/* 🔹 Modal Crear/Editar */}
      <Modal
        open={showModal}
        title={editing ? 'Editar Curso' : 'Nuevo Curso'}
        onClose={() => {
          setShowModal(false)
          setEditing(null)
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Código</label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              placeholder="Ej: MAT101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              placeholder="Ej: Matemática General"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Carrera</label>
            <input
              name="career"
              value={form.career}
              onChange={handleChange}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              placeholder="Ej: Ingeniería de Software"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Horas crédito</label>
            <input
              type="number"
              name="credit_hours"
              value={form.credit_hours}
              onChange={handleChange}
              min="1"
              max="10"
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Tipo de aula requerida</label>
            <input
              name="requires_room_type"
              value={form.requires_room_type}
              onChange={handleChange}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              placeholder="Ej: Laboratorio, Aula estándar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Tamaño preferido de sección
            </label>
            <input
              type="number"
              name="preferred_section_size"
              value={form.preferred_section_size}
              onChange={handleChange}
              min="5"
              max="100"
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
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
