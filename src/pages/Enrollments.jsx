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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">📘 Gestión de Inscripciones</h2>

      <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded-md mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            name="studentId"
            value={form.studentId}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
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
            className="border p-2 rounded w-full"
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
            className="border p-2 rounded w-full"
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
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={!form.studentId || !form.offeringId || !form.sectionId}
        >
          {editingId ? "Actualizar" : "Agregar"}
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Estudiante</th>
            <th className="p-2 border">Curso</th>
            <th className="p-2 border">Sección</th>
            <th className="p-2 border">Estado</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((e) => (
            <tr key={e.id} className="border-t">
              <td className="p-2 border">{e.student?.name || "—"}</td>
              <td className="p-2 border">{e.offering?.course?.name || "—"}</td>
              <td className="p-2 border">{e.section?.code || "—"}</td>
              <td className="p-2 border">{e.status}</td>
              <td className="p-2 border">
                <button
                  onClick={() => handleEdit(e)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(e.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
