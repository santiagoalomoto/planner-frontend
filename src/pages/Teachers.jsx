import React, { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [form, setForm] = useState({ name: '', email: '', max_weekly_hours: '', notes: '' })
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  // 🔹 Cargar docentes
  const fetchTeachers = async () => {
    try {
      const res = await api.get('/teachers')
      setTeachers(res.data)
    } catch (err) {
      console.error('❌ Error cargando docentes:', err)
      setError('No se pudieron cargar los docentes. Intenta más tarde.')
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
      setError('El nombre es obligatorio')
      return
    }

    try {
      if (editingId) {
        await api.patch(`/teachers/${editingId}`, {
          name: form.name,
          email: form.email || null,
          max_weekly_hours: form.max_weekly_hours ? parseInt(form.max_weekly_hours) : null,
          notes: form.notes || null,
        })
      } else {
        await api.post('/teachers', {
          name: form.name,
          email: form.email || null,
          max_weekly_hours: form.max_weekly_hours ? parseInt(form.max_weekly_hours) : null,
          notes: form.notes || null,
        })
      }

      setForm({ name: '', email: '', max_weekly_hours: '', notes: '' })
      setEditingId(null)
      fetchTeachers()
    } catch (err) {
      console.error('❌ Error guardando docente:', err)
      setError('No se pudo guardar el docente. Verifica los datos o permisos.')
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
    setEditingId(teacher.id)
  }

  // 🔹 Eliminar docente
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este docente?')) return
    try {
      await api.delete(`/teachers/${id}`)
      fetchTeachers()
    } catch (err) {
      console.error('❌ Error al eliminar docente:', err)
      setError('No se pudo eliminar el docente.')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">👨‍🏫 Gestión de Docentes</h1>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 shadow-md p-4 rounded-xl mb-6 flex flex-wrap gap-3 border border-gray-200"
      >
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          name="max_weekly_hours"
          placeholder="Horas máx. por semana"
          value={form.max_weekly_hours}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          name="notes"
          placeholder="Notas"
          value={form.notes}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          className={`px-5 py-2 rounded-lg text-white font-medium shadow-sm transition ${
            editingId
              ? 'bg-yellow-500 hover:bg-yellow-600'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {editingId ? 'Actualizar' : 'Agregar'}
        </button>

        {error && <p className="text-red-500 mt-2 w-full font-medium">{error}</p>}
      </form>

      {/* Tabla */}
      <div className="bg-white shadow rounded-xl p-4 border border-gray-200">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="border p-2 text-left">#</th>
              <th className="border p-2 text-left">Nombre</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Horas</th>
              <th className="border p-2 text-left">Notas</th>
              <th className="border p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No hay docentes registrados
                </td>
              </tr>
            ) : (
              teachers.map((t, i) => (
                <tr
                  key={t.id}
                  className="border-t hover:bg-gray-50 transition text-gray-800"
                >
                  <td className="border p-2">{i + 1}</td>
                  <td className="border p-2">{t.name}</td>
                  <td className="border p-2">{t.email || '—'}</td>
                  <td className="border p-2">{t.max_weekly_hours || '—'}</td>
                  <td className="border p-2">{t.notes || '—'}</td>
                  <td className="border p-2">
                    <div className="flex items-center justify-center gap-3 py-1">
                      <button
                        onClick={() => handleEdit(t)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition"
                        title="Editar docente"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition"
                        title="Eliminar docente"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
