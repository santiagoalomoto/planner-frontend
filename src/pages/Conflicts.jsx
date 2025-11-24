import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import Modal from '../components/Modal';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  Users,
  User,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function Conflicts() {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('');
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [description, setDescription] = useState('');
  const [professors, setProfessors] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConflicts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/conflicts');
      setConflicts(res.data);
    } catch (err) {
      console.error('❌ Error al cargar conflictos:', err.response?.data || err);
      alert('No se pudieron cargar los conflictos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntities = async () => {
    try {
      const [profRes, stuRes] = await Promise.all([api.get('/teachers'), api.get('/students')]);
      setProfessors(profRes.data || []);
      setStudents(stuRes.data || []);
    } catch (err) {
      console.error('❌ Error al cargar entidades:', err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchConflicts();
    fetchEntities();
  }, []);

  const createConflict = async (e) => {
    e.preventDefault();
    if (!type || !description) return;

    try {
      await api.post('/conflicts', {
        type,
        entity_type: entityType || undefined,
        entity_id: entityId || undefined,
        description,
      });

      setShowModal(false);
      setType('');
      setEntityType('');
      setEntityId('');
      setDescription('');
      fetchConflicts();
    } catch (err) {
      console.error('❌ Error al crear conflicto:', err.response?.data || err);
      alert(`No se pudo crear el conflicto. Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const entityOptions = entityType === 'professor' ? professors : students;

  const filteredConflicts = conflicts.filter(c => 
    c.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.entity_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      {/* Header Premium */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <AlertTriangle className="text-white" size={20} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Gestión de Conflictos</h1>
        </div>
        <p className="text-slate-600 ml-13">Monitorea y resuelve conflictos del sistema YAVIRAC</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 mb-6">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar conflicto..."
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
            
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <Plus size={18} />
              <span>Nuevo Conflicto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium mb-1">Total Conflictos</p>
              <p className="text-3xl font-bold text-red-700">{conflicts.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium mb-1">Profesores</p>
              <p className="text-3xl font-bold text-orange-700">
                {conflicts.filter(c => c.entity_type === 'professor').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium mb-1">Estudiantes</p>
              <p className="text-3xl font-bold text-blue-700">
                {conflicts.filter(c => c.entity_type === 'student').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <User className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Conflicts List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filteredConflicts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-100">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            {searchTerm ? 'No se encontraron conflictos' : '¡Sin conflictos!'}
          </h3>
          <p className="text-slate-500 mb-6">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'El sistema funciona correctamente'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredConflicts.map((conflict) => (
            <div
              key={conflict.id}
              className="group bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl hover:border-red-200 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <AlertTriangle className="text-white" size={24} />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-red-600 transition-colors">
                        {conflict.type}
                      </h3>
                      {conflict.entity_name && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          {conflict.entity_type === 'professor' ? (
                            <Users size={14} className="text-orange-500" />
                          ) : (
                            <User size={14} className="text-blue-500" />
                          )}
                          <span>
                            {conflict.entity_type === 'professor' ? 'Profesor' : 'Estudiante'}: <strong>{conflict.entity_name}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      Activo
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-slate-600">
                    <FileText size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm leading-relaxed">{conflict.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Premium */}
      <Modal 
        open={showModal} 
        title="Registrar Nuevo Conflicto" 
        onClose={() => {
          setShowModal(false);
          setType('');
          setEntityType('');
          setEntityId('');
          setDescription('');
        }}
      >
        <form onSubmit={createConflict} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de conflicto <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="Ej: Aula ocupada, Horario duplicado"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Relacionado con (opcional)
            </label>
            <select
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setEntityId('');
              }}
            >
              <option value="">Sin relación específica</option>
              <option value="professor">Profesor</option>
              <option value="student">Estudiante</option>
            </select>
          </div>

          {entityType && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Seleccionar {entityType === 'professor' ? 'Profesor' : 'Estudiante'}
              </label>
              <select
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {entityOptions.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name || ent.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción del conflicto <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
              placeholder="Describe el conflicto detalladamente..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              required
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Registrar Conflicto
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}