import React, { useEffect, useState } from 'react';
import {
  getStudentSections,
  createStudentSection,
  deleteStudentSection,
} from '../api/studentSections';
import api from '../api/axios'; // para obtener estudiantes y secciones
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import SectionTitle from '../components/SectionTitle'
import Card from '../components/Card'
import { Users, Search, Filter } from 'lucide-react'

export default function StudentSections() {
  const [relations, setRelations] = useState([]);
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ studentId: '', sectionId: '' });
  const [searchTerm, setSearchTerm] = useState('')

  // 🔹 Cargar asignaciones
  const loadRelations = async () => {
    const { data } = await getStudentSections();
    setRelations(data);
  };

  // 🔹 Cargar estudiantes y secciones
  const loadData = async () => {
    try {
      const [studentsRes, sectionsRes] = await Promise.all([
        api.get('/students'),
        api.get('/sections'),
      ]);
      setStudents(studentsRes.data);
      setSections(sectionsRes.data);
    } catch (err) {
      console.error('Error cargando estudiantes o secciones:', err);
    }
  };

  useEffect(() => {
    loadData();
    loadRelations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.sectionId) return alert('Seleccione estudiante y sección.');
    await createStudentSection(form);
    setForm({ studentId: '', sectionId: '' });
    setShowModal(false);
    loadRelations();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar asignación?')) {
      await deleteStudentSection(id);
      loadRelations();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6 space-y-6">
      <SectionTitle icon={Users} title="Asignaciones de Estudiantes" subtitle="Vincula estudiantes con secciones" />

      <Card>
        <div className="flex flex-wrap items-center gap-4 justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Asignaciones registradas</h3>
            <p className="text-sm text-slate-500">Lista de estudiantes asignados a secciones</p>
          </div>

          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar estudiante o sección..."
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
            <Button onClick={() => setShowModal(true)}>+ Nueva Asignación</Button>
          </div>
        </div>

        {/* Tabla de asignaciones */}
        <Table
          headers={['Estudiante', 'Sección', 'Acciones']}
          data={relations
            .filter(r => {
              if (!searchTerm) return true
              const q = searchTerm.toLowerCase()
              return (r.student?.name || '').toLowerCase().includes(q) || (r.section?.code || '').toLowerCase().includes(q)
            })
            .map((r) => [
              r.student?.name || '—',
              r.section?.code || '—',
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(r.id)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition-colors"
                >
                  Eliminar
                </button>
              </div>,
            ])}
        />
      </Card>

      {/* Modal de creación */}
      <Modal
        open={showModal}
        title="Nueva Asignación"
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Estudiante</label>
            <select
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Sección</label>
            <select
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={form.sectionId}
              onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
              required
            >
              <option value="">Seleccionar sección</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.code} - {sec.course?.name || 'Curso desconocido'} (Cupo: {sec.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl">
              Asignar Estudiante
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
