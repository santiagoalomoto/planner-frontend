import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import SectionTitle from '../components/SectionTitle'
import Card from '../components/Card'
import Button from '../components/Button'
import { Clock } from 'lucide-react'

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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  };

  const fetchTimeslots = useCallback(async () => {
    try {
      const res = await axios.get(API_URL, getAuthHeaders());
      setTimeslots(res.data);
    } catch (err) {
      console.error('Error al obtener timeslots:', err);
      alert('No se pudieron cargar los horarios.');
    }
  }, []);

  // 🔹 Cargar los timeslots al montar
  useEffect(() => {
    fetchTimeslots();
  }, [fetchTimeslots]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6 space-y-6">
      <SectionTitle icon={Clock} title="Gestión de Timeslots" subtitle="Configura los horarios disponibles" />

      {/* Formulario */}
      <Card>
        <form onSubmit={handleSubmit} className="grid gap-4">
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
              className="border rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="border rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="border rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="border rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
          <div className="mt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow hover:shadow-lg transition"
            >
              {editingId ? 'Actualizar Timeslot' : 'Agregar Timeslot'}
            </button>
          </div>
        </form>
      </Card>

      {/* Tarjetas de timeslots (estilo Courses) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {timeslots.length > 0 ? (
          timeslots.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{t.day_of_week}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Día {t.day_of_week}</h3>
                  <p className="text-sm text-slate-500 mt-1">{t.start_time} — {t.end_time}</p>
                </div>
              </div>

              <div className="mt-4 border-t pt-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">Duración: <span className="font-medium text-slate-800">{t.duration_minutes} min</span></div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(t)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">No hay timeslots registrados</div>
        )}
      </div>
    </div>
  );
}
