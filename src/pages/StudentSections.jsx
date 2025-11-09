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

export default function StudentSections() {
  const [relations, setRelations] = useState([]);
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ studentId: '', sectionId: '' });

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🎓 Asignaciones de Estudiantes</h1>
        <Button onClick={() => setShowModal(true)}>+ Nueva Asignación</Button>
      </div>

      {/* Tabla de asignaciones */}
      <Table
        headers={['Estudiante', 'Sección', 'Acciones']}
        data={relations.map((r) => [
          r.student?.name || '—',
          r.section?.code || '—',
          <div className="flex gap-2">
            <Button
              onClick={() => handleDelete(r.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </Button>
          </div>,
        ])}
      />

      {/* Modal de creación */}
      <Modal
        open={showModal}
        title="Nueva Asignación"
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Estudiante:</span>
            <select
              className="w-full border p-2 rounded mt-1"
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
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Sección:</span>
            <select
              className="w-full border p-2 rounded mt-1"
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
          </label>

          <Button type="submit" className="w-full">
            Asignar Estudiante
          </Button>
        </form>
      </Modal>
    </div>
  );
}
