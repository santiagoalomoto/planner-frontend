import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import { Calendar } from 'lucide-react'
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

  // Estado visual (badge)
  const renderStatusBadge = (status) => {
    const map = {
      active: { text: 'Activo', className: 'bg-gradient-to-r from-green-500 to-green-600 text-white', dot: 'bg-green-300' },
      // Cambiado: `draft` ahora muestra 'Registrado' con estilo simple y sin animación
      draft: { text: 'Registrado', className: 'bg-blue-100 text-blue-700 border border-blue-200', dot: 'bg-blue-300' },
      inactive: { text: 'Inactivo', className: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white', dot: 'bg-gray-300' },
    }

    const badge = map[status] || map.draft

    // Para estados con estilos simples (como Registrado) no aplicamos sombra ni pulso
    const simple = badge.className.includes('bg-blue-100')

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${badge.className} ${simple ? '' : 'shadow-lg'}`}>
        {simple ? null : <div className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`}></div>}
        <span>{badge.text}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6 space-y-6">
      <SectionTitle
        icon={Calendar}
        title="Gestión de Ofertas de Curso"
        subtitle="Administra las asignaciones de cursos, semestres y docentes"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium mb-1">Total Ofertas</p>
              <p className="text-3xl font-bold text-blue-700">{offerings.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">OF</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium mb-1">Asignadas</p>
              <p className="text-3xl font-bold text-green-700">{offerings.filter(o => o.teacher).length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white">T</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium mb-1">Sin Asignar</p>
              <p className="text-3xl font-bold text-orange-700">{offerings.filter(o => !o.teacher).length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white">-</span>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Ofertas registradas</h3>
            <p className="text-sm text-slate-500">Lista de ofertas de curso disponibles en el sistema</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setModalOpen(true)}>+ Nueva Oferta</Button>
          </div>
        </div>

        <Table
          headers={['Curso', 'Semestre', 'Docente', 'Estudiantes', 'Estado', 'Acciones']}
          data={offerings.map(off => [
            off.course?.name || '-',
            off.semester?.name || '-',
            off.teacher?.name || '(Sin asignar)',
            off.expected_students ?? 0,
            renderStatusBadge((off.status || 'draft').toLowerCase()),
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(off.id)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition-colors"
              >
                Eliminar
              </button>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Curso
            </label>
            <select
              name="courseId"
              value={form.courseId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Semestre
            </label>
            <select
              name="semesterId"
              value={form.semesterId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Docente (opcional)
            </label>
            <select
              name="teacherId"
              value={form.teacherId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
