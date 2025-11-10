import React, { useEffect, useState } from 'react'
import {
  getStudentSections,
  createStudentSection,
  deleteStudentSection,
} from '../api/studentSections'
import api from '../api/axios'
import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'
import SectionTitle from '../components/SectionTitle'

export default function StudentSections() {
  const [relations, setRelations] = useState([])
  const [students, setStudents] = useState([])
  const [sections, setSections] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ studentId: '', sectionId: '' })

  // 🔹 Cargar asignaciones
  const loadRelations = async () => {
    try {
      setLoading(true)
      const { data } = await getStudentSections()
      setRelations(data || [])
    } catch (err) {
      console.error('Error al obtener asignaciones:', err)
      alert('❌ No se pudieron cargar las asignaciones.')
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Cargar estudiantes y secciones
  const loadData = async () => {
    try {
      const [studentsRes, sectionsRes] = await Promise.all([
        api.get('/students'),
        api.get('/sections'),
      ])
      setStudents(studentsRes.data || [])
      setSections(sectionsRes.data || [])
    } catch (err) {
      console.error('Error cargando estudiantes o secciones:', err)
      alert('⚠️ Error al cargar datos de estudiantes o secciones.')
    }
  }

  useEffect(() => {
    loadData()
    loadRelations()
  }, [])

  // 🔹 Validar
  const validateForm = () => {
    if (!form.studentId) return alert('⚠️ Debes seleccionar un estudiante.')
    if (!form.sectionId) return alert('⚠️ Debes seleccionar una sección.')

    // Evitar duplicados
    const exists = relations.some(
      (r) =>
        r.student?.id === form.studentId &&
        r.section?.id === form.sectionId &&
        (!editing || r.id !== editing.id)
    )
    if (exists) {
      alert('⚠️ Este estudiante ya está asignado a esa sección.')
      return false
    }
    return true
  }

  // 🔹 Crear o actualizar
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (editing) {
        await deleteStudentSection(editing.id)
        await createStudentSection(form)
        alert('✏️ Asignación actualizada correctamente.')
      } else {
        await createStudentSection(form)
        alert('✅ Estudiante asignado correctamente.')
      }

      setForm({ studentId: '', sectionId: '' })
      setShowModal(false)
      setEditing(null)
      loadRelations()
    } catch (err) {
      console.error('Error al guardar asignación:', err)
      const msg = err.response?.data?.message || err.message || 'Error desconocido'
      alert(`❌ No se pudo guardar la asignación. ${msg}`)
    }
  }

  // 🔹 Editar
  const handleEdit = (relation) => {
    setEditing(relation)
    setForm({
      studentId: relation.student?.id || '',
      sectionId: relation.section?.id || '',
    })
    setShowModal(true)
  }

  // 🔹 Eliminar
  const handleDelete = async (id) => {
    if (!window.confirm('🗑️ ¿Seguro que deseas eliminar esta asignación?')) return
    try {
      await deleteStudentSection(id)
      alert('🗑️ Asignación eliminada correctamente.')
      loadRelations()
    } catch (err) {
      console.error('Error al eliminar asignación:', err)
      const msg = err.response?.data?.message || err.message || 'Error desconocido'
      alert(`❌ No se pudo eliminar la asignación. ${msg}`)
    }
  }

  // 🔹 Renderizar acciones
  const renderActions = (relation) => (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => handleEdit(relation)}
        className="text-blue-600 hover:text-blue-800 transition"
        title="Editar asignación"
      >
        ✏️
      </button>
      <button
        onClick={() => handleDelete(relation.id)}
        className="text-red-600 hover:text-red-800 transition"
        title="Eliminar asignación"
      >
        🗑
      </button>
    </div>
  )

  // 🔹 Filtro de búsqueda
  const filteredRelations = relations.filter(
    (r) =>
      r.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.section?.code?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <SectionTitle title="🎓 Asignaciones de Estudiantes" />
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar estudiante o sección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
          />
          <Button
            onClick={() => {
              setShowModal(true)
              setEditing(null)
              setForm({ studentId: '', sectionId: '' })
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + Nueva Asignación
          </Button>
        </div>
      </div>

      {/* Tabla de asignaciones */}
      {loading ? (
        <div className="text-center py-8 text-gray-500 animate-pulse">
          Cargando asignaciones...
        </div>
      ) : filteredRelations.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm text-gray-500">
          No hay asignaciones registradas o no coinciden con la búsqueda.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <Table
            headers={['Estudiante', 'Sección', 'Acciones']}
            data={filteredRelations.map((r) => [
              r.student?.name || '—',
              r.section?.code || '—',
              renderActions(r),
            ])}
          />
        </div>
      )}

      {/* Modal Crear/Editar Asignación */}
      <Modal
        open={showModal}
        title={editing ? 'Editar Asignación' : 'Nueva Asignación'}
        onClose={() => {
          setShowModal(false)
          setEditing(null)
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Estudiante
            </label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              required
            >
              <option value="">Seleccionar estudiante</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email || 'Sin correo'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Sección
            </label>
            <select
              value={form.sectionId}
              onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              required
            >
            <option value="">Seleccionar sección</option>
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.code} (Cupo: {sec.capacity})
              </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition">
            {editing ? 'Actualizar Asignación' : 'Asignar Estudiante'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
