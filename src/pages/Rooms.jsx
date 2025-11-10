// src/pages/Rooms.jsx
import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'
import Input from '../components/Input'
import api from '../api/axios'

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [form, setForm] = useState({
    id: null,
    code: '',
    name: '',
    capacity: '',
    type: '',
    features: '',
  })

  // 🔄 Obtener salas
  const fetchRooms = async () => {
    setLoading(true)
    try {
      const res = await api.get('/rooms')
      setRooms(res.data || [])
    } catch (err) {
      console.error('❌ Error cargando salas:', err)
      alert('❌ No se pudieron cargar las salas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  // ✍️ Cambios del formulario
  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  // 🔁 Reset formulario
  const resetForm = () => {
    setForm({ id: null, code: '', name: '', capacity: '', type: '', features: '' })
    setIsEditing(false)
  }

  // ✏️ Editar sala
  const handleEdit = room => {
    setForm({
      id: room.id,
      code: room.code || '',
      name: room.name || '',
      capacity: room.capacity?.toString() || '',
      type: room.type || '',
      features: room.features ? JSON.stringify(room.features, null, 2) : '',
    })
    setIsEditing(true)
    setModalOpen(true)
  }

  // 💾 Crear o actualizar sala
  const handleSubmit = async e => {
    e.preventDefault()

    if (!form.code.trim() || !form.name.trim() || !form.capacity) {
      return alert('⚠️ Debes llenar los campos obligatorios: código, nombre y capacidad.')
    }

    // Validar JSON en features
    let featuresParsed = undefined
    if (form.features && form.features.trim() !== '') {
      try {
        featuresParsed = JSON.parse(form.features)
      } catch {
        return alert('⚠️ El campo "Características" debe ser un JSON válido o estar vacío.')
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
        alert('✅ Sala actualizada correctamente.')
      } else {
        await api.post('/rooms', payload)
        alert('✅ Sala creada correctamente.')
      }
      resetForm()
      setModalOpen(false)
      fetchRooms()
    } catch (err) {
      console.error('❌ Error al guardar sala:', err)
      const msg = err.response?.data?.message || err.message || 'Error en la petición.'
      alert(`❌ No se pudo guardar la sala: ${msg}`)
    }
  }

  // 🗑️ Eliminar sala
  const handleDelete = async id => {
    if (!window.confirm('🗑️ ¿Deseas eliminar esta sala?')) return
    try {
      await api.delete(`/rooms/${id}`)
      alert('🗑️ Sala eliminada correctamente.')
      fetchRooms()
    } catch (err) {
      console.error('❌ Error al eliminar sala:', err)
      alert('❌ No se pudo eliminar la sala.')
    }
  }

  // 🔹 Renderizar acciones
  const renderActions = room => (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => handleEdit(room)}
        className="text-blue-600 hover:text-blue-800 transition"
        title="Editar sala"
      >
        ✏️
      </button>
      <button
        onClick={() => handleDelete(room.id)}
        className="text-red-600 hover:text-red-800 transition"
        title="Eliminar sala"
      >
        🗑
      </button>
    </div>
  )

  return (
    <div className="p-6 animate-fadeIn">
      {/* 🔹 Título */}
      <div className="flex justify-between items-center mb-6">
        <SectionTitle
          title="🏫 Gestión de Salas"
          subtitle="Administra las aulas, laboratorios y espacios disponibles"
        />
        <Button
          onClick={() => {
            setModalOpen(true)
            setIsEditing(false)
            resetForm()
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Nueva Sala
        </Button>
      </div>

      {/* 🔹 Tabla */}
      {loading ? (
        <div className="text-center py-8 text-gray-500 animate-pulse">Cargando salas...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm text-gray-500">
          No hay salas registradas todavía.
        </div>
      ) : (
        <Card className="shadow-md rounded-xl overflow-hidden">
          <Table
            headers={[
              'Código',
              'Nombre',
              'Capacidad',
              'Tipo',
              'Características',
              'Acciones',
            ]}
            data={rooms.map(r => [
              r.code,
              r.name,
              r.capacity,
              r.type || '—',
              <pre className="text-xs bg-gray-50 p-1 rounded">
                {JSON.stringify(r.features || {}, null, 2)}
              </pre>,
              renderActions(r),
            ])}
          />
        </Card>
      )}

      {/* 🔹 Modal crear/editar */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setIsEditing(false)
        }}
        title={isEditing ? 'Editar Sala' : 'Nueva Sala'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Código"
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Ej: A101"
            required
          />
          <Input
            label="Nombre"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ej: Laboratorio de Informática"
            required
          />
          <Input
            label="Capacidad"
            name="capacity"
            type="number"
            min="0"
            value={form.capacity}
            onChange={handleChange}
            placeholder="Ej: 30"
            required
          />
          <Input
            label="Tipo"
            name="type"
            value={form.type}
            onChange={handleChange}
            placeholder="Ej: aula, laboratorio, auditorio..."
          />
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Características (JSON opcional)
            </label>
            <textarea
              name="features"
              value={form.features}
              onChange={handleChange}
              placeholder='Ej: {"computers":20,"projector":true}'
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md h-28"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              color="secondary"
              type="button"
              onClick={() => {
                setModalOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition"
            >
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
