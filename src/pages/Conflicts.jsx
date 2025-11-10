import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';

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

  // Cargar conflictos
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

  // Cargar entidades
  const fetchEntities = async () => {
    try {
      // Obtener profesores y estudiantes desde sus endpoints respectivos.
      // Antes se usaba `/users?role=student` (devuelve registros de la tabla users),
      // pero el servicio backend busca el nombre en la tabla `students` por `student.id`.
      // Por eso es importante pedir `/students` aquí para que los ids coincidan.
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

  // Crear conflicto
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">⚠️ Conflictos</h2>
        <Button onClick={() => setShowModal(true)}>+ Nuevo Conflicto</Button>
      </div>

      {loading ? (
        <p>Cargando conflictos...</p>
      ) : conflicts.length === 0 ? (
        <p>No se encontraron conflictos.</p>
      ) : (
        <Table
          headers={['Tipo', 'Entidad', 'Descripción']}
          data={conflicts.map((c) => [c.type, c.entity_name || '-', c.description])}
        />
      )}

      <Modal open={showModal} title="Nuevo Conflicto" onClose={() => setShowModal(false)}>
        <form onSubmit={createConflict} className="space-y-3">
          <input
            className="w-full border p-2 rounded"
            placeholder="Tipo de conflicto (ej: Aula ocupada)"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />

          <select
            className="w-full border p-2 rounded"
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setEntityId('');
            }}
          >
            <option value="">Seleccionar entidad (opcional)</option>
            <option value="professor">Profesor</option>
            <option value="student">Alumno</option>
          </select>

          {entityType && (
            <select
              className="w-full border p-2 rounded"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
            >
              <option value="">Seleccionar {entityType === 'professor' ? 'Profesor' : 'Alumno'}</option>
              {entityOptions.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.name || ent.username}
                </option>
              ))}
            </select>
          )}

          <textarea
            className="w-full border p-2 rounded"
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Button type="submit" className="w-full">
            Guardar
          </Button>
        </form>
      </Modal>
    </div>
  );
}
