import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'
import Input from '../components/Input'
import api from '../api/axios' // ✅ Se usa la instancia con token

const API = '/offerings'
const COURSES_API = '/courses'
const SEMESTERS_API = '/semesters'
const TEACHERS_API = '/teachers'

export default function Offerings() {
  const [offerings, setOfferings] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // 📋 Datos para selects
  const [courses, setCourses] = useState([])
  const [semesters, setSemesters] = useState([])
  const [teachers, setTeachers] = useState([])

  const [form, setForm] = useState({
    courseId: '',
    semesterId: '',
    teacherId: '',
    expected_students: '',
  })

  // 🔄 Obtener ofertas
  const getOfferings = async () => {
    setLoading(true)
    try {
      const res = await api.get(API)
      setOfferings(res.data)
    } catch (err) {
      console.error('❌ Error al obtener ofertas:', err)
      alert('No se pudieron cargar las ofertas.')
    } finally {
      setLoading(false)
    }
  }

  // 📦 Obtener datos para selects
  const getSelectData = async () => {
    try {
      const [coursesRes, semestersRes, teachersRes] = await Promise.all([
        api.get(COURSES_API),
        api.get(SEMESTERS_API),
        api.get(TEACHERS_API),
      ])
      setCourses(coursesRes.data)
      setSemesters(semestersRes.data)
      setTeachers(teachersRes.data)
    } catch (err) {
      console.error('❌ Error cargando datos de selects:', err)
    }
  }

  // ✍️ Manejar cambios del formulario
  const handleChange = e => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  // 💾 Guardar nueva oferta
  const handleSubmit = async () => {
    if (!form.courseId || !form.semesterId) {
      alert('Los campos de curso y semestre son obligatorios.')
      return
    }

    try {
      await api.post(API, {
        ...form,
        expected_students: Number(form.expected_students) || 0,
      })
      setModalOpen(false)
      setForm({
        courseId: '',
        semesterId: '',
        teacherId: '',
        expected_students: '',
      })
      getOfferings()
    } catch (err) {
      console.error('❌ Error al crear oferta:', err)
      alert('No se pudo crear la oferta.')
    }
  }

  // 🗑️ Eliminar oferta
  const handleDelete = async id => {
    if (!window.confirm('¿Seguro que deseas eliminar esta oferta?')) return
    try {
      await api.delete(`${API}/${id}`)
      getOfferings()
    } catch (err) {
      console.error('❌ Error al eliminar oferta:', err)
      alert('No se pudo eliminar la oferta.')
    }
  }

  // 🚀 Al montar el componente
  useEffect(() => {
    getOfferings()
    getSelectData()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <SectionTitle
        title="Gestión de Ofertas de Curso"
        subtitle="Administra las asignaciones de cursos, semestres y docentes"
      />

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Ofertas registradas</h3>
          <Button onClick={() => setModalOpen(true)}>+ Nueva Oferta</Button>
        </div>

        <Table
          headers={['Curso', 'Semestre', 'Docente', 'Estudiantes', 'Estado', 'Acciones']}
          data={offerings.map(off => [
            off.course?.name || '-',
            off.semester?.name || '-',
            off.teacher?.name || '(Sin asignar)',
            off.expected_students ?? 0,
            off.status || 'Activo',
            <div className="flex gap-2">
              <Button
                color="danger"
                size="sm"
                onClick={() => handleDelete(off.id)}
              >
                Eliminar
              </Button>
            </div>,
          ])}
          loading={loading}
        />
      </Card>

      {/* 🧩 Modal de creación */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Oferta">
        <div className="space-y-4">
          {/* Select de cursos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curso
            </label>
            <select
              name="courseId"
              value={form.courseId}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 outline-none focus:ring focus:ring-blue-300"
            >
              <option value="">Seleccione un curso</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select de semestres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semestre
            </label>
            <select
              name="semesterId"
              value={form.semesterId}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 outline-none focus:ring focus:ring-blue-300"
            >
              <option value="">Seleccione un semestre</option>
              {semesters.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select de docentes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Docente (opcional)
            </label>
            <select
              name="teacherId"
              value={form.teacherId}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 outline-none focus:ring focus:ring-blue-300"
            >
              <option value="">(Sin asignar)</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campo de número */}
          <Input
            type="number"
            label="Estudiantes esperados"
            name="expected_students"
            value={form.expected_students}
            onChange={handleChange}
            placeholder="0"
          />

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
