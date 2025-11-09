// src/pages/Rooms.jsx
import React, { useEffect, useState } from 'react'
import api from '../api/axios'

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Gestión de Salas</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white shadow p-4 rounded mb-6 grid gap-3">
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {isEditing ? 'Actualizar sala' : 'Crear sala'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Salas registradas</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : rooms.length === 0 ? (
          <p>No hay salas registradas.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">#</th>
                  <th className="border p-2 text-left">Código</th>
                  <th className="border p-2 text-left">Nombre</th>
                  <th className="border p-2 text-left">Capacidad</th>
                  <th className="border p-2 text-left">Tipo</th>
                  <th className="border p-2 text-left">Características</th>
                  <th className="border p-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r, i) => (
                  <tr key={r.id}>
                    <td className="border p-2">{i + 1}</td>
                    <td className="border p-2">{r.code}</td>
                    <td className="border p-2">{r.name}</td>
                    <td className="border p-2">{r.capacity}</td>
                    <td className="border p-2">{r.type || '—'}</td>
                    <td className="border p-2">
                      <pre className="text-xs">{JSON.stringify(r.features || {}, null, 2)}</pre>
                    </td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleEdit(r)}
                        className="mr-2 text-indigo-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-600 hover:underline"
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
      </div>
    </div>
  )
}
