import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import SectionTitle from '../components/SectionTitle'
import Card from '../components/Card'
import { Users, Search, Filter } from 'lucide-react'

export default function Students() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('')

  const [editingStudent, setEditingStudent] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [courseId, setCourseId] = useState('');
  const [semesterId, setSemesterId] = useState('');

  // 🔹 Obtener cursos y semestres
  const fetchRelations = async () => {
    try {
      const [resCourses, resSemesters] = await Promise.all([
        api.get('/courses'),
        api.get('/semesters'),
      ]);
      setCourses(resCourses.data);
      setSemesters(resSemesters.data);
    } catch (err) {
      console.error('Error al obtener cursos o semestres:', err);
    }
  };

  // 🔹 Obtener estudiantes
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students');
      const mapped = res.data.map((s) => ({
        ...s,
        courseName: s.course?.name || '—',
        semesterName: s.semester?.name || '—',
      }));
      setStudents(mapped);
    } catch (err) {
      console.error('Error al obtener estudiantes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelations().then(fetchStudents);
  }, []);

  // 🔹 Abrir modal para crear
  const openCreateModal = () => {
    setEditingStudent(null);
    setName('');
    setEmail('');
    setCourseId('');
    setSemesterId('');
    setShowModal(true);
  };

  // 🔹 Abrir modal para editar
  const openEditModal = (student) => {
    setEditingStudent(student);
    setName(student.name);
    setEmail(student.email || '');
    setCourseId(student.courseId || '');
    setSemesterId(student.semesterId || '');
    setShowModal(true);
  };

  // 🔹 Crear o actualizar estudiante
  const saveStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        courseId,
        semesterId,
        ...(email && { email }),
      };

      if (editingStudent) {
        // Editar
        const res = await api.patch(`/students/${editingStudent.id}`, payload);
        const updated = {
          ...res.data,
          courseName: res.data.course?.name || '—',
          semesterName: res.data.semester?.name || '—',
        };
        setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        // Crear
        const res = await api.post('/students', payload);
        const newStudent = {
          ...res.data,
          courseName: res.data.course?.name || '—',
          semesterName: res.data.semester?.name || '—',
        };
        setStudents((prev) => [...prev, newStudent]);
      }

      setShowModal(false);
      setEditingStudent(null);
      setName('');
      setEmail('');
      setCourseId('');
      setSemesterId('');
    } catch (err) {
      console.error('Error al guardar estudiante:', err);
      alert('No se pudo guardar el estudiante. Asegúrate de que el correo sea válido.');
    }
  };

  // 🔹 Eliminar estudiante
  const deleteStudent = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este estudiante?')) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error al eliminar estudiante:', err);
      alert('No se pudo eliminar el estudiante');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6 space-y-6">
      <SectionTitle icon={Users} title="Gestión de Estudiantes" subtitle="Administra los estudiantes registrados" />

      <Card>
        <div className="flex flex-wrap items-center gap-4 justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Estudiantes</h3>
            <p className="text-sm text-slate-500">Lista y gestión de estudiantes</p>
          </div>

          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar nombre, correo o curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-slate-700 font-medium">
              <Filter size={18} />
              <span>Filtros</span>
            </button>
            <Button onClick={openCreateModal}>+ Nuevo Estudiante</Button>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-600">Cargando...</p>
        ) : (
          <Table
            columns={['Nombre', 'Correo', 'Curso', 'Semestre', 'Acciones']}
            data={students
              .filter(s => {
                if (!searchTerm) return true
                const q = searchTerm.toLowerCase()
                return (
                  (s.name || '').toLowerCase().includes(q) ||
                  (s.email || '').toLowerCase().includes(q) ||
                  (s.courseName || '').toLowerCase().includes(q)
                )
              })
              .map((s) => [
                s.name,
                s.email || '—',
                s.courseName,
                s.semesterName,
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(s)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteStudent(s.id)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>,
              ])}
          />
        )}
      </Card>

      {/* 🔹 Modal corregido */}
      <Modal
        open={showModal} // ✅ importante
        title={editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={saveStudent} className="space-y-4">
          <input
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <select
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
          >
            <option value="">Seleccionar curso</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
            required
          >
            <option value="">Seleccionar semestre</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.year})
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl">
              {editingStudent ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
