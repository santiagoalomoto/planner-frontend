import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'
import Input from '../components/Input'
import api from '../api/axios'

const API = '/users'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState({
    id: null,
    username: '',
    password: '',
    role: 'student',
  })

  // 🔄 Obtener usuarios
  const getUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get(API)
      setUsers(res.data || [])
    } catch (err) {
      console.error('❌ Error al obtener usuarios:', err)
      alert('❌ No se pudieron cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }

  // ✍️ Manejar cambios del formulario
  const handleChange = e => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  // ✅ Validar formulario
  const validateForm = () => {
    if (!form.username.trim()) {
      alert('⚠️ El nombre de usuario es obligatorio.')
      return false
    }
    if (!editing && !form.password.trim()) {
      alert('⚠️ La contraseña es obligatoria para nuevos usuarios.')
      return false
    }
    if (form.password && form.password.length < 6) {
      alert('⚠️ La contraseña debe tener al menos 6 caracteres.')
      return false
    }
    return true
  }

  // 💾 Crear o actualizar usuario
  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (editing) {
        await api.put(`${API}/${form.id}`, form)
        alert('✅ Usuario actualizado exitosamente.')
      } else {
        await api.post(API, form)
        alert('✅ Usuario creado exitosamente.')
      }

      setModalOpen(false)
      setForm({ id: null, username: '', password: '', role: 'student' })
      setEditing(false)
      getUsers()
    } catch (err) {
      console.error('❌ Error al guardar usuario:', err)
      const msg = err.response?.data?.message || err.message || 'Error desconocido'
      alert(`❌ No se pudo guardar el usuario. ${msg}`)
    }
  }

  // 🗑️ Eliminar usuario
  const handleDelete = async id => {
    if (!window.confirm('🗑️ ¿Seguro que deseas eliminar este usuario?')) return
    try {
      await api.delete(`${API}/${id}`)
      alert('🗑️ Usuario eliminado correctamente.')
      getUsers()
    } catch (err) {
      console.error('❌ Error al eliminar usuario:', err)
      const msg = err.response?.data?.message || err.message || 'Error desconocido'
      alert(`❌ No se pudo eliminar el usuario. ${msg}`)
    }
  }

  // ✏️ Editar usuario
  const handleEdit = user => {
    setForm({
      id: user.id,
      username: user.username,
      password: '',
      role: user.role,
    })
    setEditing(true)
    setModalOpen(true)
  }

  useEffect(() => {
    getUsers()
  }, [])

  // 🔹 Renderizar acciones
  const renderActions = user => (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => handleEdit(user)}
        className="text-blue-600 hover:text-blue-800 transition"
        title="Editar usuario"
      >
        ✏️
      </button>
      <button
        onClick={() => handleDelete(user.id)}
        className="text-red-600 hover:text-red-800 transition"
        title="Eliminar usuario"
      >
        🗑
      </button>
    </div>
  )

  return (
    <div className="p-6 animate-fadeIn">
      {/* 🔹 Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <SectionTitle
          title="👥 Gestión de Usuarios"
          subtitle="Administra las cuentas de los usuarios del sistema"
        />
        <Button
          onClick={() => {
            setModalOpen(true)
            setEditing(false)
            setForm({ id: null, username: '', password: '', role: 'student' })
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Nuevo Usuario
        </Button>
      </div>

      {/* 🔹 Tabla de usuarios */}
      {loading ? (
        <div className="text-center py-8 text-gray-500 animate-pulse">
          Cargando usuarios...
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm text-gray-500">
          No hay usuarios registrados todavía.
        </div>
      ) : (
        <Card className="shadow-md rounded-xl overflow-hidden">
          <Table
            headers={[
              'Usuario',
              'Rol',
              'ID Relacionado',
              'Fecha de Creación',
              'Acciones',
            ]}
            data={users.map(u => [
              u.username,
              u.role.charAt(0).toUpperCase() + u.role.slice(1),
              u.related_id || '—',
              new Date(u.created_at).toLocaleDateString(),
              renderActions(u),
            ])}
          />
        </Card>
      )}

      {/* 🔹 Modal de creación / edición */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(false)
        }}
        title={editing ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de usuario"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Ej: jdoe"
            required
          />

          <Input
            label={editing ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="********"
          />

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Rol del usuario
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
            >
              <option value="admin">Administrador</option>
              <option value="coordinator">Coordinador</option>
              <option value="teacher">Docente</option>
              <option value="student">Estudiante</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              color="secondary"
              type="button"
              onClick={() => {
                setModalOpen(false)
                setEditing(false)
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition"
            >
              {editing ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
