import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [editingCourse, setEditingCourse] = useState(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [career, setCareer] = useState('');
  const [creditHours, setCreditHours] = useState(3);
  const [requiresRoomType, setRequiresRoomType] = useState('');
  const [preferredSectionSize, setPreferredSectionSize] = useState(30);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error('Error al obtener cursos:', err.response?.data || err);
      alert('No se pudieron cargar los cursos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setCode('');
    setName('');
    setCareer('');
    setCreditHours(3);
    setRequiresRoomType('');
    setPreferredSectionSize(30);
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setCode(course.code);
    setName(course.name);
    setCareer(course.career || '');
    setCreditHours(course.credit_hours || 3);
    setRequiresRoomType(course.requires_room_type || '');
    setPreferredSectionSize(course.preferred_section_size || 30);
    setShowModal(true);
  };

  const saveCourse = async (e) => {
    e.preventDefault();
    if (!name) return alert('El nombre del curso es obligatorio.');

    try {
      const payload = {
        code: code || name.toUpperCase().slice(0, 6),
        name,
        career: career || 'General',
        credit_hours: creditHours,
        requires_room_type: requiresRoomType || 'Aula estándar',
        preferred_section_size: preferredSectionSize,
      };

      if (editingCourse) {
        await api.patch(`/courses/${editingCourse.id}`, payload);
        alert('✅ Curso actualizado correctamente.');
      } else {
        await api.post('/courses', payload);
        alert('✅ Curso creado correctamente.');
      }

      setShowModal(false);
      fetchCourses();
    } catch (err) {
      console.error('Error al guardar curso:', err.response?.data || err);
      alert(`No se pudo guardar el curso. Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este curso?')) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses(prev => prev.filter(c => c.id !== id));
      alert('🗑️ Curso eliminado correctamente.');
    } catch (err) {
      console.error('Error al eliminar curso:', err.response?.data || err);
      alert('❌ No se pudo eliminar el curso.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Gestión de Cursos</h2>
        <Button onClick={openCreateModal}>+ Nuevo Curso</Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          headers={['Código', 'Nombre', 'Carrera', 'Créditos', 'Sección Preferida', 'Tipo de Aula', 'Acciones']}
          data={courses.map(c => [
            c.code,
            c.name,
            c.career || '—',
            c.credit_hours || '—',
            c.preferred_section_size || '—',
            c.requires_room_type || '—',
            <div className="flex gap-2">
              <Button onClick={() => openEditModal(c)} className="bg-yellow-500 hover:bg-yellow-600">Editar</Button>
              <Button onClick={() => deleteCourse(c.id)} className="bg-red-500 hover:bg-red-600">Eliminar</Button>
            </div>,
          ])}
        />
      )}

      {/** Modal corregido */}
      <Modal open={showModal} title={editingCourse ? 'Editar Curso' : 'Nuevo Curso'} onClose={() => setShowModal(false)}>
        <form onSubmit={saveCourse} className="space-y-3">
          <input
            className="w-full border p-2 rounded"
            placeholder="Código del curso (opcional)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Nombre del curso"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Carrera o área"
            value={career}
            onChange={(e) => setCareer(e.target.value)}
          />
          <input
            type="number"
            className="w-full border p-2 rounded"
            placeholder="Número de créditos"
            value={creditHours}
            onChange={(e) => setCreditHours(parseInt(e.target.value))}
            min="1"
            max="10"
            required
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Tipo de aula requerida (ej. Laboratorio, Aula estándar)"
            value={requiresRoomType}
            onChange={(e) => setRequiresRoomType(e.target.value)}
          />
          <input
            type="number"
            className="w-full border p-2 rounded"
            placeholder="Tamaño preferido de sección"
            value={preferredSectionSize}
            onChange={(e) => setPreferredSectionSize(parseInt(e.target.value))}
            min="5"
            max="100"
          />

          <Button type="submit" className="w-full">
            {editingCourse ? 'Actualizar' : 'Guardar'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
