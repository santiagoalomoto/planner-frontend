import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'
import SectionTitle from '../components/SectionTitle'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { motion } from 'framer-motion'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
      toast.error('❌ Error al cargar los cursos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  // 🔹 Validar formulario
  const validateForm = () => {
    if (!form.name.trim()) {
      toast.warning('⚠️ El nombre del curso es obligatorio.')
      return false
    }
    if (isNaN(form.credit_hours) || form.credit_hours <= 0) {
      toast.warning('⚠️ Las horas crédito deben ser mayores a 0.')
      return false
    }
    if (isNaN(form.preferred_section_size) || form.preferred_section_size < 5) {
      toast.warning('⚠️ El tamaño de sección debe ser al menos 5.')
      return false
    }
    return true
  }

  // 🔹 Guardar o actualizar
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    const payload = {
      code: form.code || form.name.trim().toUpperCase().slice(0, 6),
      name: form.name.trim(),
      career: form.career.trim() || 'General',
      credit_hours: Number(form.credit_hours),
      requires_room_type: form.requires_room_type.trim() || 'Aula estándar',
      preferred_section_size: Number(form.preferred_section_size),
    }

    try {
      if (editing) {
        await api.patch(`/courses/${editing.id}`, payload)
        toast.success('✏️ Curso actualizado correctamente.')
      } else {
        await api.post('/courses', payload)
        toast.success('✅ Curso creado exitosamente.')
      }
      setShowModal(false)
      setEditing(null)
      resetForm()
      fetchCourses()
    } catch (err) {
      toast.error(`❌ No se pudo guardar el curso: ${err.response?.data?.message || err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () =>
    setForm({
      code: '',
      name: '',
      career: '',
      credit_hours: 3,
      requires_room_type: '',
      preferred_section_size: 30,
    })

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
    if (!window.confirm('🗑️ ¿Seguro que deseas eliminar este curso?')) return
    try {
      await api.delete(`/courses/${course.id}`)
      toast.info('🗑️ Curso eliminado correctamente.')
      fetchCourses()
    } catch (err) {
      toast.error('❌ Error al eliminar el curso.')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

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
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2500} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-center mb-6"
      >
        <SectionTitle title="📘 Gestión de Cursos" />
        <Button
          onClick={() => {
            setShowModal(true)
            setEditing(null)
            resetForm()
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Nuevo Curso
        </Button>
      </motion.div>

      {/* 📋 Tabla de cursos */}
      {loading ? (
        <p className="text-gray-500 italic text-center py-10">Cargando cursos...</p>
      ) : courses.length === 0 ? (
        <p className="text-gray-500 italic text-center py-10">No hay cursos registrados.</p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white shadow-md rounded-xl overflow-hidden"
        >
          <Table
            headers={[
              'Código',
              'Nombre',
              'Carrera',
              'Créditos',
              'Sección Pref.',
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
        </motion.div>
      )}

      {/* 🪟 Modal Crear/Editar */}
      <Modal
        open={showModal}
        title={editing ? 'Editar Curso' : 'Nuevo Curso'}
        onClose={() => {
          setShowModal(false)
          setEditing(null)
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'code', label: 'Código', placeholder: 'Ej: MAT101' },
            { name: 'name', label: 'Nombre', placeholder: 'Ej: Matemática General', required: true },
            { name: 'career', label: 'Carrera', placeholder: 'Ej: Ingeniería de Software' },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium mb-1 text-gray-600">{f.label}</label>
              <input
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
                required={f.required}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium mb-1 text-gray-600">
                Tamaño preferido
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Tipo de aula requerida
            </label>
            <input
              name="requires_room_type"
              value={form.requires_room_type}
              onChange={handleChange}
              placeholder="Ej: Laboratorio, Aula estándar"
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className={`w-full bg-blue-600 hover:bg-blue-700 transition ${
              saving ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Guardar'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
