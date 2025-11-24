import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import SectionTitle from '../components/SectionTitle'
import Card from '../components/Card'
import Button from '../components/Button'
import { Users } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6 space-y-6">
      <SectionTitle icon={Users} title="Gestión de Docentes" subtitle="Administra los docentes del sistema" />

      <Card>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />

          <input
            type="number"
            name="max_weekly_hours"
            placeholder="Horas máx. por semana"
            value={form.max_weekly_hours}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />

          <div className="flex gap-2 items-center">
            <input
              type="text"
              name="notes"
              placeholder="Notas"
              value={form.notes}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all">
              Agregar
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
                <tr className="bg-slate-100">
                  <th className="border p-3 text-left text-sm text-slate-600 w-14">N°</th>
                <th className="border p-3 text-left text-sm text-slate-600">Nombre</th>
                <th className="border p-3 text-left text-sm text-slate-600">Email</th>
                <th className="border p-3 text-left text-sm text-slate-600">Horas</th>
                <th className="border p-3 text-left text-sm text-slate-600">Notas</th>
                <th className="border p-3 text-left text-sm text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t, i) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="border p-3 text-sm">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-700 rounded-full font-medium">
                        {i + 1}
                      </div>
                    </td>
                  <td className="border p-3 text-sm">{t.name}</td>
                  <td className="border p-3 text-sm text-slate-600">{t.email || '—'}</td>
                  <td className="border p-3 text-sm text-slate-600">{t.max_weekly_hours || '—'}</td>
                  <td className="border p-3 text-sm text-slate-600">{t.notes || '—'}</td>
                  <td className="border p-3 text-sm">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition-colors"
                    >
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
