import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Gestión de Estudiantes</h2>
        <Button onClick={openCreateModal}>+ Nuevo Estudiante</Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          columns={['Nombre', 'Correo', 'Curso', 'Semestre', 'Acciones']}
          data={students.map((s) => [
            s.name,
            s.email || '—',
            s.courseName,
            s.semesterName,
            <div className="flex gap-2">
              <Button
                onClick={() => openEditModal(s)}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                Editar
              </Button>
              <Button
                onClick={() => deleteStudent(s.id)}
                className="bg-red-500 hover:bg-red-600"
              >
                Eliminar
              </Button>
            </div>,
          ])}
        />
      )}

      {/* 🔹 Modal corregido */}
      <Modal
        open={showModal} // ✅ importante
        title={editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={saveStudent} className="space-y-3">
          <input
            className="w-full border p-2 rounded"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            className="w-full border p-2 rounded"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <select
            className="w-full border p-2 rounded"
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
            className="w-full border p-2 rounded"
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

          <Button type="submit" className="w-full">
            {editingStudent ? 'Actualizar' : 'Guardar'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
