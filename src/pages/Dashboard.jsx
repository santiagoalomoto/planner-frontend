import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">📊 Panel Principal</h1>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Bienvenido al panel principal. Desde aquí puedes acceder a las diferentes secciones del sistema,
          como la gestión de estudiantes, docentes, cursos, semestres y más.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/dashboard/semesters"
            className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <h2 className="text-xl font-semibold mb-2">📅 Semestres</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona los semestres académicos y sus periodos.
            </p>
          </Link>

          <Link
            to="/dashboard/students"
            className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <h2 className="text-xl font-semibold mb-2">🎓 Estudiantes</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Administra la información de los estudiantes registrados.
            </p>
          </Link>

          <Link
            to="/dashboard/teachers"
            className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <h2 className="text-xl font-semibold mb-2">👩‍🏫 Docentes</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona los datos y asignaciones de los profesores.
            </p>
          </Link>

          <Link
            to="/dashboard/courses"
            className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <h2 className="text-xl font-semibold mb-2">📘 Cursos</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Crea y administra los cursos académicos disponibles.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
