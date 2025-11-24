import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Award,
  Users,
  Building2,
  GraduationCap
} from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filtrar cursos
  const filteredCourses = courses.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.career?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-3 flex-1">
          <div className="h-6 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      {/* Header Premium */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="text-white" size={20} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Gestión de Cursos</h1>
        </div>
        <p className="text-slate-600 ml-13">Administra el catálogo académico de YAVIRAC</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 mb-6">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar curso, código o carrera..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-slate-700 font-medium">
              <Filter size={18} />
              <span>Filtros</span>
            </button>
            
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <Plus size={18} />
              <span>Nuevo Curso</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium mb-1">Total Cursos</p>
              <p className="text-3xl font-bold text-blue-700">{courses.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium mb-1">Créditos Totales</p>
              <p className="text-3xl font-bold text-orange-700">
                {courses.reduce((sum, c) => sum + (c.credit_hours || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium mb-1">Carreras</p>
              <p className="text-3xl font-bold text-green-700">
                {new Set(courses.map(c => c.career).filter(Boolean)).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium mb-1">Promedio Sección</p>
              <p className="text-3xl font-bold text-purple-700">
                {Math.round(courses.reduce((sum, c) => sum + (c.preferred_section_size || 0), 0) / courses.length || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Course Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-100">
          <BookOpen className="mx-auto text-slate-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No hay cursos</h3>
          <p className="text-slate-500 mb-6">
            {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Comienza agregando tu primer curso al catálogo'}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={18} />
            Crear Curso
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      {course.code || 'SIN CÓDIGO'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-sm text-slate-500">{course.career || 'General'}</p>
                </div>
              </div>

              {/* Course Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Award size={16} className="text-orange-500" />
                  <span className="text-sm">
                    <strong>{course.credit_hours || 0}</strong> créditos
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-slate-600">
                  <Users size={16} className="text-green-500" />
                  <span className="text-sm">
                    Sección: <strong>{course.preferred_section_size || 30}</strong> estudiantes
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 size={16} className="text-purple-500" />
                  <span className="text-sm">
                    {course.requires_room_type || 'Aula estándar'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => openEditModal(course)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition-all"
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button 
                  onClick={() => deleteCourse(course.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Premium */}
      <Modal 
        open={showModal} 
        title={editingCourse ? 'Editar Curso' : 'Nuevo Curso'} 
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={saveCourse} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Código del curso (opcional)
            </label>
            <input
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Código del curso (opcional)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre del curso <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Nombre del curso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Carrera o área
            </label>
            <input
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Carrera o área"
              value={career}
              onChange={(e) => setCareer(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Número de créditos <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Número de créditos"
              value={creditHours}
              onChange={(e) => setCreditHours(parseInt(e.target.value))}
              min="1"
              max="10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de aula requerida
            </label>
            <input
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Tipo de aula requerida (ej. Laboratorio, Aula estándar)"
              value={requiresRoomType}
              onChange={(e) => setRequiresRoomType(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tamaño preferido de sección
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Tamaño preferido de sección"
              value={preferredSectionSize}
              onChange={(e) => setPreferredSectionSize(parseInt(e.target.value))}
              min="5"
              max="100"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-3 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              {editingCourse ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}