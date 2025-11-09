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

  // 🔹 Cargar los timeslots al montar
  useEffect(() => {
    fetchTimeslots();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Validación básica antes de enviar
      if (!form.day_of_week || !form.start_time || !form.end_time || !form.duration_minutes) {
        alert('Por favor completa todos los campos.');
        return;
      }

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
        await axios.post(API_URL, payload, getAuthHeaders());
        alert('Timeslot creado ✅');
      }

      setForm({ day_of_week: '', start_time: '', end_time: '', duration_minutes: '' });
      setEditingId(null);
      fetchTimeslots();
    } catch (err) {
      console.error('Error al guardar:', err);
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert('Error al guardar el timeslot.');
      }
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🕓 Gestión de Timeslots</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block font-semibold">Día de la semana</label>
            <input
              type="number"
              name="day_of_week"
              min="1"
              max="7"
              value={form.day_of_week}
              onChange={handleChange}
              required
              className="border rounded w-full p-2"
            />
          </div>
          <div>
            <label className="block font-semibold">Hora inicio</label>
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
            <label className="block font-semibold">Hora fin</label>
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
            <label className="block font-semibold">Duración (min)</label>
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
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {editingId ? 'Actualizar Timeslot' : 'Agregar Timeslot'}
        </button>
      </form>

      {/* Tabla */}
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
                <td className="py-2 px-3">{t.day_of_week}</td>
                <td className="py-2 px-3">{t.start_time}</td>
                <td className="py-2 px-3">{t.end_time}</td>
                <td className="py-2 px-3">{t.duration_minutes}</td>
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
                No hay timeslots registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
