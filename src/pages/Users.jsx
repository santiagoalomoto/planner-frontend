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

  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'student',
  })

  // 🔄 Obtener usuarios
  const getUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get(API)
      setUsers(res.data)
    } catch (err) {
      console.error('❌ Error al obtener usuarios:', err)
      alert('No se pudieron cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }

  // ✍️ Cambios en formulario
  const handleChange = e => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  // 💾 Crear nuevo usuario
  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      alert('Debe ingresar un nombre de usuario y una contraseña.')
      return
    }

    try {
      await api.post(API, form)
      setModalOpen(false)
      setForm({ username: '', password: '', role: 'student' })
      getUsers()
    } catch (err) {
      console.error('❌ Error al crear usuario:', err)
      alert('No se pudo crear el usuario.')
    }
  }

  // 🗑️ Eliminar usuario
  const handleDelete = async id => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return
    try {
      await api.delete(`${API}/${id}`)
      getUsers()
    } catch (err) {
      console.error('❌ Error al eliminar usuario:', err)
      alert('No se pudo eliminar el usuario.')
    }
  }

  useEffect(() => {
    getUsers()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <SectionTitle
        title="Gestión de Usuarios"
        subtitle="Administra las cuentas de los usuarios del sistema"
      />

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Usuarios registrados</h3>
          <Button onClick={() => setModalOpen(true)}>+ Nuevo Usuario</Button>
        </div>

        <Table
          headers={['Usuario', 'Rol', 'ID Relacionado', 'Fecha de Creación', 'Acciones']}
          data={users.map(u => [
            u.username,
            u.role,
            u.related_id || '(N/A)',
            new Date(u.created_at).toLocaleDateString(),
            <div className="flex gap-2">
              <Button
                color="danger"
                size="sm"
                onClick={() => handleDelete(u.id)}
              >
                Eliminar
              </Button>
            </div>,
          ])}
          loading={loading}
        />
      </Card>

      {/* 🧩 Modal de creación */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Usuario">
        <div className="space-y-4">
          <Input
            label="Nombre de usuario"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Ej: jdoe"
            required
          />

          <Input
            label="Contraseña"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="********"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 outline-none focus:ring focus:ring-blue-300"
            >
              <option value="admin">Admin</option>
              <option value="coordinator">Coordinador</option>
              <option value="teacher">Docente</option>
              <option value="student">Estudiante</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button color="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
