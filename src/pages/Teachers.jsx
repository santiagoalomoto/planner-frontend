import React, { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [form, setForm] = useState({ name: '', email: '', max_weekly_hours: '', notes: '' })

  // 🔹 Cargar docentes
  const fetchTeachers = async () => {
    try {
      const res = await api.get('/teachers')
      setTeachers(res.data)
    } catch (err) {
      console.error('❌ Error cargando docentes:', err)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  // 🔹 Manejo de formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // 🔹 Crear docente
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) return alert('El nombre es obligatorio')
    try {
      await api.post('/teachers', {
        name: form.name,
        email: form.email || null,
        max_weekly_hours: form.max_weekly_hours ? parseInt(form.max_weekly_hours) : null,
        notes: form.notes || null,
      })
      setForm({ name: '', email: '', max_weekly_hours: '', notes: '' })
      fetchTeachers()
    } catch (err) {
      console.error('❌ Error creando docente:', err)
      alert('No se pudo crear el docente. Verifica los datos o los permisos.')
    }
  }

  // 🔹 Eliminar docente
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este docente?')) return
    try {
      await api.delete(`/teachers/${id}`)
      fetchTeachers()
    } catch (err) {
      console.error('❌ Error al eliminar docente:', err)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Gestión de Docentes</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white shadow p-4 rounded mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
          className="border p-2 rounded flex-1"
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          className="border p-2 rounded flex-1"
        />
        <input
          type="number"
          name="max_weekly_hours"
          placeholder="Horas máx. por semana"
          value={form.max_weekly_hours}
          onChange={handleChange}
          className="border p-2 rounded flex-1"
        />
        <input
          type="text"
          name="notes"
          placeholder="Notas"
          value={form.notes}
          onChange={handleChange}
          className="border p-2 rounded flex-1"
        />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Agregar
        </button>
      </form>

      {/* Tabla */}
      <div className="bg-white shadow rounded p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">#</th>
              <th className="border p-2 text-left">Nombre</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Horas</th>
              <th className="border p-2 text-left">Notas</th>
              <th className="border p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t, i) => (
              <tr key={t.id}>
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{t.name}</td>
                <td className="border p-2">{t.email || '—'}</td>
                <td className="border p-2">{t.max_weekly_hours || '—'}</td>
                <td className="border p-2">{t.notes || '—'}</td>
                <td className="border p-2">
                  <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:underline">
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
