import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'
import SectionTitle from '../components/SectionTitle'

export default function Students() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const [editingStudent, setEditingStudent] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [courseId, setCourseId] = useState('')
  const [semesterId, setSemesterId] = useState('')

  // 🔹 Obtener cursos y semestres
  const fetchRelations = async () => {
    try {
      const [resCourses, resSemesters] = await Promise.all([
        api.get('/courses'),
        api.get('/semesters'),
      ])
      setCourses(resCourses.data)
      setSemesters(resSemesters.data)
    } catch (err) {
      console.error('Error al obtener cursos o semestres:', err)
      alert('❌ No se pudieron cargar los cursos o semestres.')
    }
  }

  // 🔹 Obtener estudiantes
  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await api.get('/students')
      const mapped = res.data.map((s) => ({
        ...s,
        courseName: s.course?.name || '—',
        semesterName: s.semester?.name || '—',
      }))
      setStudents(mapped)
    } catch (err) {
      console.error('Error al obtener estudiantes:', err)
      alert('❌ No se pudieron cargar los estudiantes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRelations().then(fetchStudents)
  }, [])

  // 🔹 Validar formulario
  const validateForm = () => {
    if (!name.trim()) {
      alert('⚠️ El nombre del estudiante es obligatorio.')
      return false
    }
    if (!courseId) {
      alert('⚠️ Debes seleccionar un curso.')
      return false
    }
    if (!semesterId) {
      alert('⚠️ Debes seleccionar un semestre.')
      return false
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      alert('⚠️ El correo electrónico no es válido.')
      return false
    }
    return true
  }

  // 🔹 Abrir modal para crear
  const openCreateModal = () => {
    setEditingStudent(null)
    setName('')
    setEmail('')
    setCourseId('')
    setSemesterId('')
    setShowModal(true)
  }

  // 🔹 Abrir modal para editar
  const openEditModal = (student) => {
    setEditingStudent(student)
    setName(student.name)
    setEmail(student.email || '')
    setCourseId(student.courseId || '')
    setSemesterId(student.semesterId || '')
    setShowModal(true)
  }

  // 🔹 Crear o actualizar estudiante
  const saveStudent = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const payload = {
        name: name.trim(),
        courseId,
        semesterId,
        ...(email && { email: email.trim() }),
      }

      if (editingStudent) {
        const res = await api.patch(`/students/${editingStudent.id}`, payload)
        const updated = {
          ...res.data,
          courseName: res.data.course?.name || '—',
          semesterName: res.data.semester?.name || '—',
        }
        setStudents((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        )
        alert('✏️ Estudiante actualizado correctamente.')
      } else {
        const res = await api.post('/students', payload)
        const newStudent = {
          ...res.data,
          courseName: res.data.course?.name || '—',
          semesterName: res.data.semester?.name || '—',
        }
        setStudents((prev) => [...prev, newStudent])
        alert('✅ Estudiante creado exitosamente.')
      }

      setShowModal(false)
      setEditingStudent(null)
      setName('')
      setEmail('')
      setCourseId('')
      setSemesterId('')
    } catch (err) {
      console.error('Error al guardar estudiante:', err)
      const msg = err.response?.data?.message || err.message || 'Error desconocido'
      alert(`❌ No se pudo guardar el estudiante. ${msg}`)
    }
  }

  // 🔹 Eliminar estudiante
  const deleteStudent = async (id) => {
    if (!window.confirm('🗑️ ¿Seguro que deseas eliminar este estudiante?')) return
    try {
      await api.delete(`/students/${id}`)
      setStudents((prev) => prev.filter((s) => s.id !== id))
      alert('🗑️ Estudiante eliminado correctamente.')
    } catch (err) {
      console.error('Error al eliminar estudiante:', err)
      alert('❌ No se pudo eliminar el estudiante.')
    }
  }

  // 🔹 Renderizar acciones
  const renderActions = (student) => (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => openEditModal(student)}
        className="text-blue-600 hover:text-blue-800 transition"
        title="Editar estudiante"
      >
        ✏️
      </button>
      <button
        onClick={() => deleteStudent(student.id)}
        className="text-red-600 hover:text-red-800 transition"
        title="Eliminar estudiante"
      >
        🗑
      </button>
    </div>
  )

  return (
    <div className="p-6 animate-fadeIn">
      {/* 🔹 Header */}
      <div className="flex justify-between items-center mb-6">
        <SectionTitle title="🎓 Gestión de Estudiantes" />
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
          + Nuevo Estudiante
        </Button>
      </div>

      {/* 🔹 Tabla */}
      {loading ? (
        <div className="text-center py-8 text-gray-500 animate-pulse">
          Cargando estudiantes...
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm text-gray-500">
          No hay estudiantes registrados todavía.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <Table
            headers={['Nombre', 'Correo', 'Curso', 'Semestre', 'Acciones']}
            data={students.map((s) => [
              s.name,
              s.email || '—',
              s.courseName,
              s.semesterName,
              renderActions(s),
            ])}
          />
        </div>
      )}

      {/* 🔹 Modal Crear/Editar */}
      <Modal
        open={showModal}
        title={editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={saveStudent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Nombre completo</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              placeholder="Ej: juan@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Curso</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              required
            >
              <option value="">Seleccionar curso</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Semestre</label>
            <select
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2 rounded-md"
              required
            >
              <option value="">Seleccionar semestre</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.year})
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition">
            {editingStudent ? 'Actualizar' : 'Guardar'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
