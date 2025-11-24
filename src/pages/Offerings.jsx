import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import { Calendar } from 'lucide-react'
import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'
import Input from '../components/Input'
import api from '../api/axios'

const API = '/offerings'
const COURSES_API = '/courses'
const SEMESTERS_API = '/semesters'
const TEACHERS_API = '/teachers'

export default function Offerings() {
  const [offerings, setOfferings] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Para EDITAR
  const [editingId, setEditingId] = useState(null)

  // Datos selects
  const [courses, setCourses] = useState([])
  const [semesters, setSemesters] = useState([])
  const [teachers, setTeachers] = useState([])

  const [form, setForm] = useState({
    courseId: '',
    semesterId: '',
    teacherId: '',
    expected_students: '',
  })

  // ============================
  //   CARGA DE LISTAS
  // ============================
  const getOfferings = async () => {
    setLoading(true)
    try {
      const res = await api.get(API)
      setOfferings(res.data)
    } catch (err) {
      alert('No se pudieron cargar las ofertas.')
    } finally {
      setLoading(false)
    }
  }

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
      console.error('Error en selects')
    }
  }

  useEffect(() => {
    getOfferings()
    getSelectData()
  }, [])

  // ============================
  //    FORM CHANGE
  // ============================
  const handleChange = e => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  // ============================
  //     CREAR OFERTA
  // ============================
  const handleSubmit = async () => {
    if (!form.courseId || !form.semesterId) return alert("Curso y semestre son obligatorios")

    try {
      await api.post(API, {
        ...form,
        expected_students: Number(form.expected_students) || 0
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
      alert("No se pudo crear la oferta")
    }
  }

  // ============================
  //     ELIMINAR
  // ============================
  const handleDelete = async id => {
    if (!window.confirm("¿Eliminar oferta?")) return
    try {
      await api.delete(`${API}/${id}`)
      getOfferings()
    } catch (err) {
      alert("No se pudo eliminar")
    }
  }

  // ============================
  //     EDITAR (ABRIR MODAL)
  // ============================
  const handleEdit = (off) => {
    setEditingId(off.id)
    setForm({
      courseId: off.course?.id || "",
      semesterId: off.semester?.id || "",
      teacherId: off.teacher?.id || "",
      expected_students: off.expected_students || 0,
    })
    setModalOpen(true)
  }

  // ============================
  //     ACTUALIZAR OFERTA
  // ============================
  const handleUpdate = async () => {
    try {
      await api.patch(`${API}/${editingId}`, {
        ...form,
        expected_students: Number(form.expected_students) || 0,
      })

      setModalOpen(false)
      setEditingId(null)

      setForm({
        courseId: '',
        semesterId: '',
        teacherId: '',
        expected_students: '',
      })

      getOfferings()
    } catch (err) {
      alert("No se pudo actualizar la oferta")
    }
  }

  // BADGE
  const renderStatusBadge = (status) => {
    const map = {
      active: { text: 'Activo', className: 'bg-gradient-to-r from-green-500 to-green-600 text-white', dot: 'bg-green-300' },
      draft: { text: 'Registrado', className: 'bg-blue-100 text-blue-700 border border-blue-200', dot: 'bg-blue-300' },
      inactive: { text: 'Inactivo', className: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white', dot: 'bg-gray-300' },
    }
    const badge = map[status] || map.draft
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
        subtitle="Administra cursos, semestres y docentes"
      />

      {/* CARD CON TOTALIZADORES */}
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

      {/* TABLA */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Ofertas registradas</h3>
            <p className="text-sm text-slate-500">Lista de ofertas creadas</p>
          </div>
          <Button onClick={() => setModalOpen(true)}>+ Nueva Oferta</Button>
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

              {/* BOTÓN EDITAR */}
              <button
                onClick={() => handleEdit(off)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors"
              >
                Editar
              </button>

              {/* BOTÓN ELIMINAR */}
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

      {/* MODAL CREAR / EDITAR */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null); }} title={editingId ? "Editar Oferta" : "Nueva Oferta"}>
        <div className="space-y-4">

          {/* Curso */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Curso</label>
            <select
              name="courseId"
              value={form.courseId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg"
            >
              <option value="">Seleccione un curso</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Semestre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Semestre</label>
            <select
              name="semesterId"
              value={form.semesterId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg"
            >
              <option value="">Seleccione un semestre</option>
              {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Docente */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Docente (opcional)</label>
            <select
              name="teacherId"
              value={form.teacherId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg"
            >
              <option value="">(Sin asignar)</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <Input
            type="number"
            label="Estudiantes esperados"
            name="expected_students"
            value={form.expected_students}
            onChange={handleChange}
            placeholder="0"
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button color="secondary" onClick={() => { setModalOpen(false); setEditingId(null); }}>
              Cancelar
            </Button>

            {/* 🔥 CAMBIO SOLO AQUÍ */}
            {editingId ? (
              <Button onClick={handleUpdate}>Actualizar</Button>
            ) : (
              <Button onClick={handleSubmit}>Guardar</Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
