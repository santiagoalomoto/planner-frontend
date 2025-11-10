import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/timeslots';

export default function Timeslots() {
  const [timeslots, setTimeslots] = useState([]);
  const [form, setForm] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    duration_minutes: '',
  });
  const [editingId, setEditingId] = useState(null);

  // Cargar timeslots al montar
  useEffect(() => {
    fetchTimeslots();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchTimeslots = async () => {
    try {
      const res = await axios.get(API_URL, getAuthHeaders());
      setTimeslots(res.data);
    } catch (err) {
      console.error('Error al obtener timeslots:', err);
      alert('No se pudieron cargar los horarios.');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Validaciones adicionales: no permitir horario fin antes de inicio
  const validateTimeslot = ({ start_time, end_time, duration_minutes }) => {
    const start = new Date(`1970-01-01T${start_time}:00`);
    const end = new Date(`1970-01-01T${end_time}:00`);
    if (end <= start) return 'La hora de fin debe ser mayor que la hora de inicio.';
    if (duration_minutes <= 0) return 'La duración debe ser mayor a 0 minutos.';
    const diffMinutes = (end - start) / 60000;
    if (diffMinutes < duration_minutes) return 'La duración no puede ser mayor que el intervalo de tiempo.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateTimeslot(form);
    if (error) {
      alert(error);
      return;
    }

    try {
      const payload = {
        day_of_week: parseInt(form.day_of_week, 10),
        start_time: form.start_time,
        end_time: form.end_time,
        duration_minutes: parseInt(form.duration_minutes, 10),
      };

      if (editingId) {
        await axios.patch(`${API_URL}/${editingId}`, payload, getAuthHeaders());
        alert('Timeslot actualizado ✅');
      } else {
        // Validación de solapamiento con otros timeslots
        const overlap = timeslots.some(
          (t) =>
            t.day_of_week === payload.day_of_week &&
            ((payload.start_time >= t.start_time && payload.start_time < t.end_time) ||
              (payload.end_time > t.start_time && payload.end_time <= t.end_time))
        );
        if (overlap) {
          alert('⚠️ Este horario se solapa con otro existente.');
          return;
        }

        await axios.post(API_URL, payload, getAuthHeaders());
        alert('Timeslot creado ✅');
      }

      setForm({ day_of_week: '', start_time: '', end_time: '', duration_minutes: '' });
      setEditingId(null);
      fetchTimeslots();
    } catch (err) {
      console.error('Error al guardar:', err);
      alert(err.response?.data?.message || 'Error al guardar el timeslot.');
    }
  };

  const handleEdit = (t) => {
    setForm({
      day_of_week: t.day_of_week,
      start_time: t.start_time,
      end_time: t.end_time,
      duration_minutes: t.duration_minutes,
    });
    setEditingId(t.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este timeslot?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
      fetchTimeslots();
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('No se pudo eliminar.');
    }
  };

  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🕓 Gestión de Horarios</h1>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-4 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div>
          <label className="block font-semibold mb-1">Día de la semana</label>
          <select
            name="day_of_week"
            value={form.day_of_week}
            onChange={handleChange}
            required
            className="border rounded w-full p-2"
          >
            <option value="">Selecciona un día</option>
            {dayNames.map((d, i) => (
              <option key={i} value={i + 1}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Hora inicio</label>
          <input
            type="time"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            required
            className="border rounded w-full p-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Hora fin</label>
          <input
            type="time"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            required
            className="border rounded w-full p-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Duración (minutos)</label>
          <input
            type="number"
            name="duration_minutes"
            min="1"
            value={form.duration_minutes}
            onChange={handleChange}
            required
            className="border rounded w-full p-2"
          />
        </div>

        <div className="md:col-span-4">
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
          >
            {editingId ? 'Actualizar Horario' : 'Agregar Horario'}
          </button>
        </div>
      </form>

      {/* Tabla de horarios */}
      <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-3 text-left">Día</th>
            <th className="py-2 px-3 text-left">Inicio</th>
            <th className="py-2 px-3 text-left">Fin</th>
            <th className="py-2 px-3 text-left">Duración</th>
            <th className="py-2 px-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {timeslots.length > 0 ? (
            timeslots.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-3">{dayNames[t.day_of_week - 1]}</td>
                <td className="py-2 px-3">{t.start_time}</td>
                <td className="py-2 px-3">{t.end_time}</td>
                <td className="py-2 px-3">{t.duration_minutes} min</td>
                <td className="py-2 px-3 text-center">
                  <button
                    onClick={() => handleEdit(t)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No hay horarios registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
