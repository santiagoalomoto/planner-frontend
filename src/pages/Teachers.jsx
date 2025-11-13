import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'
import SectionTitle from '../components/SectionTitle'

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    max_weekly_hours: '',
    notes: '',
  })
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // 🔹 Cargar docentes
  const fetchTeachers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/teachers')
      setTeachers(res.data)
    } catch (err) {
      console.error('❌ Error cargando docentes:', err)
      setError('No se pudieron cargar los docentes. Intenta más tarde.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  // 🔹 Manejo de formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // 🔹 Crear o actualizar docente
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('⚠️ El nombre es obligatorio.')
      return
    }

    try {
      const payload = {
        name: form.name,
        email: form.email || null,
        max_weekly_hours: form.max_weekly_hours
          ? parseInt(form.max_weekly_hours)
          : null,
        notes: form.notes || null,
      }

      if (editing) {
        await api.patch(`/teachers/${editing.id}`, payload)
        alert('✏️ Docente actualizado correctamente.')
      } else {
        await api.post('/teachers', payload)
        alert('✅ Docente agregado exitosamente.')
      }

      setForm({ name: '', email: '', max_weekly_hours: '', notes: '' })
      setEditing(null)
      setShowModal(false)
      fetchTeachers()
    } catch (err) {
      console.error('❌ Error guardando docente:', err)
      setError('❌ No se pudo guardar el docente. Verifica los datos o permisos.')
    }
  }

  // 🔹 Editar docente
  const handleEdit = (teacher) => {
    setForm({
      name: teacher.name || '',
      email: teacher.email || '',
      max_weekly_hours: teacher.max_weekly_hours || '',
      notes: teacher.notes || '',
    })
    setEditing(teacher)
    setShowModal(true)
  }

  // 🔹 Eliminar docente
  const handleDelete = async (id) => {
    if (!window.confirm('🗑️ ¿Eliminar este docente?')) return
    try {
      await api.delete(`/teachers/${id}`)
      alert('🗑️ Docente eliminado correctamente.')
      fetchTeachers()
    } catch (err) {
      console.error('❌ Error al eliminar docente:', err)
      setError('No se pudo eliminar el docente.')
    }
  }

  // 🔹 Acciones en tabla
  const renderActions = (t) => (
    <div className="flex justify-center gap-2">
      <button
        onClick={() => handleEdit(t)}
        className="text-blue-600 hover:text-blue-800 transition"
        title="Editar docente"
      >
        ✏️
      </button>
      <button
        onClick={() => handleDelete(t.id)}
        className="text-red-600 hover:text-red-800 transition"
        title="Eliminar docente"
      >
        🗑
      </button>
    </div>
  )

  return (
    <div className="p-6 animate-fadeIn">
      {/* 🔹 Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <SectionTitle title="👨‍🏫 Gestión de Docentes" />
        <Button
          onClick={() => {
            setShowModal(true)
            setEditing(null)
            setForm({ name: '', email: '', max_weekly_hours: '', notes: '' })
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Nuevo Docente
        </Button>
      </div>

      {/* 🔹 Contenido principal */}
      {loading ? (
        <div className="text-center py-8 text-gray-500 animate-pulse">
          Cargando docentes...
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm text-gray-500">
          No hay docentes registrados todavía.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <Table
            headers={['#', 'Nombre', 'Email', 'Horas/Semana', 'Notas', 'Acciones']}
            data={teachers.map((t, i) => [
              i + 1,
              t.name,
              t.email || '—',
              t.max_weekly_hours || '—',
              t.notes || '—',
              renderActions(t),
            ])}
          />
        </div>
      )}

      {/* 🔹 Modal Crear/Editar */}
      <Modal
        open={showModal}
        title={editing ? 'Editar Docente' : 'Nuevo Docente'}
        onClose={() => {
          setShowModal(false)
          setEditing(null)
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Nombre completo
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              placeholder="Ej: docente@instituto.edu"
            />
          </div>

          {/* Horas semanales */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Horas máximas por semana
            </label>
            <input
              type="number"
              name="max_weekly_hours"
              value={form.max_weekly_hours}
              onChange={handleChange}
              min="0"
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              placeholder="Ej: 20"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Notas
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="2"
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              placeholder="Comentarios adicionales..."
            />
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
