// src/pages/Rooms.jsx
import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import SectionTitle from '../components/SectionTitle'
import Card from '../components/Card'
import Button from '../components/Button'
import { Building2 } from 'lucide-react'

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    id: null,
    code: '',
    name: '',
    capacity: '',
    type: '',
    features: '', // JSON string in textarea
  })

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const res = await api.get('/rooms')
      setRooms(res.data || [])
    } catch (err) {
      console.error('Error cargando salas:', err)
      alert('No se pudo cargar las salas. Revisa la consola.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const resetForm = () => {
    setForm({ id: null, code: '', name: '', capacity: '', type: '', features: '' })
    setIsEditing(false)
  }

  const handleEdit = (room) => {
    setForm({
      id: room.id,
      code: room.code || '',
      name: room.name || '',
      capacity: room.capacity?.toString() || '',
      type: room.type || '',
      features: room.features ? JSON.stringify(room.features, null, 2) : '',
    })
    setIsEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.code.trim() || !form.name.trim() || !form.capacity) {
      return alert('Rellena los campos obligatorios: code, name, capacity')
    }

    // convertir features a json si es posible
    let featuresParsed = undefined
    if (form.features && form.features.trim() !== '') {
      try {
        featuresParsed = JSON.parse(form.features)
      } catch {
        return alert('El campo "Características" debe ser JSON válido o vacío.')
      }
    }

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      capacity: parseInt(form.capacity, 10),
      type: form.type?.trim() || undefined,
      features: featuresParsed,
    }

    try {
      if (isEditing && form.id) {
        await api.patch(`/rooms/${form.id}`, payload)
        alert('Sala actualizada ✅')
      } else {
        await api.post('/rooms', payload)
        alert('Sala creada ✅')
      }
      resetForm()
      fetchRooms()
    } catch (err) {
      console.error('Error al guardar sala:', err)
      const msg = err.response?.data?.message || err.message || 'Error en la petición'
      alert(`No se pudo guardar la sala: ${msg}`)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta sala?')) return
    try {
      await api.delete(`/rooms/${id}`)
      fetchRooms()
    } catch (err) {
      console.error('Error al eliminar sala:', err)
      alert('No se pudo eliminar la sala. Revisa la consola.')
    }
  }

  const totalCapacity = rooms.reduce((acc, r) => acc + (Number(r.capacity) || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6 space-y-6">
      <SectionTitle icon={Building2} title="Gestión de Salas" subtitle="Administra aulas, laboratorios y espacios" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200 shadow-lg">
          <p className="text-blue-600 text-sm font-medium mb-1">Total Salas</p>
          <p className="text-2xl font-bold text-blue-700">{rooms.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200 shadow-lg">
          <p className="text-green-600 text-sm font-medium mb-1">Capacidad Total</p>
          <p className="text-2xl font-bold text-green-700">{totalCapacity}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200 shadow-lg">
          <p className="text-orange-600 text-sm font-medium mb-1">Tipos distintos</p>
          <p className="text-2xl font-bold text-orange-700">{Array.from(new Set(rooms.map(r => (r.type || '').toString().toLowerCase()))).filter(Boolean).length}</p>
        </div>
      </div>

      {/* Formulario */}
      <Card>
        <form onSubmit={handleSubmit} className="grid gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            name="code"
            placeholder="Código (A101)"
            value={form.code}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="name"
            placeholder="Nombre (Laboratorio 1)"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="capacity"
            type="number"
            min="0"
            placeholder="Capacidad"
            value={form.capacity}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            name="type"
            placeholder="Tipo (aula, laboratorio, etc.)"
            value={form.type}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <div>
            <label className="text-sm text-gray-600">Características (JSON opcional)</label>
            <textarea
              name="features"
              placeholder='Ej: {"computers":20,"projector":true}'
              value={form.features}
              onChange={handleChange}
              className="w-full border p-2 rounded h-24"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow hover:shadow-lg transition"
          >
            {isEditing ? 'Actualizar sala' : 'Crear sala'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
      </Card>

      {/* Lista */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">Salas registradas</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : rooms.length === 0 ? (
          <p>No hay salas registradas.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border p-3 text-left">#</th>
                  <th className="border p-3 text-left">Código</th>
                  <th className="border p-3 text-left">Nombre</th>
                  <th className="border p-3 text-left">Capacidad</th>
                  <th className="border p-3 text-left">Tipo</th>
                  <th className="border p-3 text-left">Características</th>
                  <th className="border p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="border p-3">{i + 1}</td>
                    <td className="border p-3">{r.code}</td>
                    <td className="border p-3">{r.name}</td>
                    <td className="border p-3">{r.capacity}</td>
                    <td className="border p-3">{r.type || '—'}</td>
                    <td className="border p-3">
                      <pre className="text-xs">{JSON.stringify(r.features || {}, null, 2)}</pre>
                    </td>
                    <td className="border p-3">
                      <button
                        onClick={() => handleEdit(r)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200 transition-colors mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
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
        )}
      </Card>
    </div>
  )
}
