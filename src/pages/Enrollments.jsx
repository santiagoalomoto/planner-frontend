// src/pages/Enrollments.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import SectionTitle from '../components/SectionTitle'
import Card from '../components/Card'
import Button from '../components/Button'
import { Users, Building2 } from 'lucide-react'

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [form, setForm] = useState({ studentId: "", offeringId: "", sectionId: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [enrRes, stuRes, offRes, secRes] = await Promise.all([
        api.get("/enrollments"),
        api.get("/students"),
        api.get("/offerings"),
        api.get("/sections"),
      ]);

      setEnrollments(enrRes.data);
      setStudents(stuRes.data);
      setOfferings(offRes.data);
      setSections(secRes.data);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudieron cargar los datos. Intenta iniciar sesión de nuevo.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "offeringId") {
      // Filtrar secciones con cupo
      const filteredSec = sections
        .map((s) => {
          const maxCap = s.assigned_room?.capacity ?? s.capacity ?? 0;
          const currentEnrollments = enrollments.filter((enr) => enr.section?.id === s.id).length;
          const remainingSeats = maxCap - currentEnrollments;
          return { ...s, remainingSeats };
        })
        .filter((s) => s.offering?.id === value && s.remainingSeats > 0);

      setFilteredSections(filteredSec);
      setForm((prev) => ({ ...prev, sectionId: "" }));

      // Filtrar estudiantes que no están inscritos en la oferta
      const enrolledStudentIds = enrollments
        .filter((enr) => enr.offering?.id === value)
        .map((enr) => enr.student?.id);
      const filteredStu = students.filter((s) => !enrolledStudentIds.includes(s.id));
      setFilteredStudents(filteredStu);
      setForm((prev) => ({ ...prev, studentId: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // limpiar errores anteriores

    if (!form.studentId || !form.offeringId || !form.sectionId) {
      setError("Debes seleccionar estudiante, oferta y sección.");
      return;
    }

    // Debug: mostrar lo que se va a enviar al backend
    console.log("Formulario enviado:", form);

    try {
      if (editingId) {
        await api.patch(`/enrollments/${editingId}`, form);
      } else {
        await api.post("/enrollments", form);
      }

      setForm({ studentId: "", offeringId: "", sectionId: "" });
      setEditingId(null);
      setFilteredSections([]);
      setFilteredStudents([]);
      loadData();
    } catch (err) {
      console.error("Error al guardar:", err);

      // Extraer mensaje de error del backend
      let msg = "Error desconocido al guardar.";
      if (err.response) {
        if (Array.isArray(err.response.data?.message)) {
          msg = err.response.data.message.join(", ");
        } else if (typeof err.response.data?.message === "string") {
          msg = err.response.data.message;
        } else if (typeof err.response.data === "string") {
          msg = err.response.data;
        }
      }

      setError(msg);
    }
  };

  const handleEdit = (enrollment) => {
    setForm({
      studentId: enrollment.student?.id || "",
      offeringId: enrollment.offering?.id || "",
      sectionId: enrollment.section?.id || "",
    });

    const filteredSec = sections
      .map((s) => {
        const maxCap = s.assigned_room?.capacity ?? s.capacity ?? 0;
        const currentEnrollments = enrollments.filter(
          (enr) => enr.section?.id === s.id && enr.id !== enrollment.id
        ).length;
        const remainingSeats = maxCap - currentEnrollments;
        return { ...s, remainingSeats };
      })
      .filter((s) => s.offering?.id === enrollment.offering?.id && s.remainingSeats > 0);

    setFilteredSections(filteredSec);

    const enrolledStudentIds = enrollments
      .filter((enr) => enr.offering?.id === enrollment.offering?.id && enr.id !== enrollment.id)
      .map((enr) => enr.student?.id);
    const filteredStu = students.filter((s) => !enrolledStudentIds.includes(s.id));
    setFilteredStudents(filteredStu);

    setEditingId(enrollment.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar inscripción?")) {
      try {
        await api.delete(`/enrollments/${id}`);
        loadData();
      } catch (err) {
        console.error("Error al eliminar:", err);
        setError("No se pudo eliminar la inscripción.");
      }
    }
  };

  const renderStatusBadge = (status) => {
    if (!status) return <span className="text-slate-600">—</span>
    const s = (status || '').toString().toLowerCase()
    const map = {
      active: { text: 'Activo', className: 'bg-gradient-to-r from-green-500 to-green-600 text-white' },
      draft: { text: 'Registrado', className: 'bg-blue-100 text-blue-700 border border-blue-200' },
      cancelled: { text: 'Cancelado', className: 'bg-gray-300 text-gray-800' },
    }
    const badge = map[s]
    if (!badge) return <span className="capitalize text-slate-700">{status}</span>
    return <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>{badge.text}</span>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6 space-y-6">
      <SectionTitle icon={Users} title="Gestión de Inscripciones" subtitle="Maneja matriculaciones de estudiantes por sección" />

      {/* Form Card */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={!form.offeringId || filteredStudents.length === 0}
            >
              <option value="">
                {filteredStudents.length === 0
                  ? "No hay estudiantes disponibles"
                  : "Seleccionar Estudiante"}
              </option>
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              name="offeringId"
              value={form.offeringId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Seleccionar Oferta</option>
              {offerings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.course?.name || o.id}
                </option>
              ))}
            </select>

            <select
              name="sectionId"
              value={form.sectionId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={!form.offeringId || filteredSections.length === 0}
            >
              <option value="">
                {filteredSections.length === 0
                  ? "No hay secciones con cupo disponible"
                  : "Seleccionar Sección"}
              </option>
              {filteredSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} (Cupos restantes: {s.remainingSeats})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              disabled={!form.studentId || !form.offeringId || !form.sectionId}
            >
              {editingId ? "Actualizar" : "Agregar"}
            </button>

            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </form>
      </Card>

      {/* Stats + Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium mb-1">Total Inscripciones</p>
              <p className="text-3xl font-bold text-blue-700">{enrollments.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="text-white" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium mb-1">Estudiantes</p>
              <p className="text-3xl font-bold text-green-700">{students.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white">S</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium mb-1">Ofertas</p>
              <p className="text-3xl font-bold text-orange-700">{offerings.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white">O</span>
            </div>
          </div>
        </div>

        {/* Tarjeta 'Secciones' eliminada (visual-only) */}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-3 text-left text-sm text-slate-600">Estudiante</th>
                <th className="p-3 text-left text-sm text-slate-600">Curso</th>
                <th className="p-3 text-left text-sm text-slate-600">Sección</th>
                <th className="p-3 text-left text-sm text-slate-600">Estado</th>
                <th className="p-3 text-left text-sm text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="border p-3 text-sm">{e.student?.name || "—"}</td>
                  <td className="border p-3 text-sm">{e.offering?.course?.name || "—"}</td>
                  <td className="border p-3 text-sm">{e.section?.code || "—"}</td>
                  <td className="border p-3 text-sm">{renderStatusBadge(e.status)}</td>
                  <td className="border p-3 text-sm">
                    <button
                      onClick={() => handleEdit(e)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200 transition-colors mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
