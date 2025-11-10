// src/pages/Enrollments.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

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
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "offeringId") {
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
    setError("");

    if (!form.studentId || !form.offeringId || !form.sectionId) {
      setError("Debes seleccionar estudiante, oferta y sección.");
      return;
    }

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
      let msg = "Error desconocido al guardar.";
      if (err.response) {
        if (Array.isArray(err.response.data?.message)) msg = err.response.data.message.join(", ");
        else if (typeof err.response.data?.message === "string") msg = err.response.data.message;
        else if (typeof err.response.data === "string") msg = err.response.data;
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">📘 Gestión de Inscripciones</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-4 rounded-xl shadow-md mb-6 space-y-4 border border-gray-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            name="studentId"
            value={form.studentId}
            onChange={handleChange}
            required
            className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
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
            className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
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
            className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
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

        <button
          type="submit"
          className={`mt-3 px-5 py-2 rounded-lg text-white font-medium shadow-sm transition 
            ${
              editingId
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          disabled={!form.studentId || !form.offeringId || !form.sectionId}
        >
          {editingId ? "Actualizar" : "Agregar"}
        </button>

        {error && <p className="text-red-500 mt-2 font-medium">{error}</p>}
      </form>

      <table className="w-full border border-gray-300 rounded-xl overflow-hidden shadow-sm">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="p-2 border">Estudiante</th>
            <th className="p-2 border">Curso</th>
            <th className="p-2 border">Sección</th>
            <th className="p-2 border">Estado</th>
            <th className="p-2 border text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No hay inscripciones registradas
              </td>
            </tr>
          ) : (
            enrollments.map((e) => (
              <tr
                key={e.id}
                className="border-t hover:bg-gray-50 transition text-gray-800"
              >
                <td className="p-2 border">{e.student?.name || "—"}</td>
                <td className="p-2 border">{e.offering?.course?.name || "—"}</td>
                <td className="p-2 border">{e.section?.code || "—"}</td>
                <td className="p-2 border">{e.status}</td>
                <td className="p-2 border">
                  <div className="flex items-center justify-center gap-3 py-1">
                    <button
                      onClick={() => handleEdit(e)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition"
                      title="Editar inscripción"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition"
                      title="Eliminar inscripción"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
