import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import {
  CalendarDays,
  GraduationCap,
  Users,
  BookOpen,
  Layers,
  Clock,
  Settings,
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    sections: 0,
  });

  const [loading, setLoading] = useState(true);

  // 🔹 Cargar métricas desde el backend
  const fetchStats = async () => {
    try {
      const [studentsRes, teachersRes, coursesRes, sectionsRes] = await Promise.all([
        api.get("/students"),
        api.get("/teachers"),
        api.get("/courses"),
        api.get("/sections"),
      ]);

      setStats({
        students: studentsRes.data.length || 0,
        teachers: teachersRes.data.length || 0,
        courses: coursesRes.data.length || 0,
        sections: sectionsRes.data.length || 0,
      });
    } catch (error) {
      console.error("❌ Error cargando métricas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    {
      title: "📅 Semestres",
      icon: <CalendarDays className="text-blue-600 w-8 h-8" />,
      description: "Gestiona los semestres académicos y sus periodos.",
      to: "/dashboard/semesters",
      color: "from-blue-100 to-blue-50",
    },
    {
      title: "🎓 Estudiantes",
      icon: <GraduationCap className="text-green-600 w-8 h-8" />,
      description: "Administra los estudiantes registrados en el sistema.",
      to: "/dashboard/students",
      color: "from-green-100 to-green-50",
    },
    {
      title: "👩‍🏫 Docentes",
      icon: <Users className="text-purple-600 w-8 h-8" />,
      description: "Gestiona los datos y asignaciones de los docentes.",
      to: "/dashboard/teachers",
      color: "from-purple-100 to-purple-50",
    },
    {
      title: "📘 Cursos",
      icon: <BookOpen className="text-orange-600 w-8 h-8" />,
      description: "Crea y administra los cursos académicos disponibles.",
      to: "/dashboard/courses",
      color: "from-orange-100 to-orange-50",
    },
    {
      title: "🧩 Secciones",
      icon: <Layers className="text-pink-600 w-8 h-8" />,
      description: "Organiza las secciones y horarios de los cursos.",
      to: "/dashboard/sections",
      color: "from-pink-100 to-pink-50",
    },
    {
      title: "🕒 Horarios",
      icon: <Clock className="text-cyan-600 w-8 h-8" />,
      description: "Consulta y organiza los horarios de clases y aulas.",
      to: "/dashboard/schedules",
      color: "from-cyan-100 to-cyan-50",
    },
    {
      title: "⚙️ Configuración",
      icon: <Settings className="text-gray-700 w-8 h-8" />,
      description: "Ajusta los parámetros generales del sistema.",
      to: "/dashboard/settings",
      color: "from-gray-100 to-gray-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-gray-100">
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Título */}
        <motion.h1
          className="text-4xl font-bold mb-2 text-blue-700 dark:text-blue-400"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          📊 Panel Principal
        </motion.h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Bienvenido al sistema de planificación académica. Desde aquí puedes
          acceder a las distintas áreas de gestión y monitorear datos en tiempo real.
        </p>

        {/* 🔹 Sección de métricas */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {[
            { label: "Estudiantes", value: stats.students, color: "bg-green-100 text-green-800" },
            { label: "Docentes", value: stats.teachers, color: "bg-purple-100 text-purple-800" },
            { label: "Cursos", value: stats.courses, color: "bg-orange-100 text-orange-800" },
            { label: "Secciones", value: stats.sections, color: "bg-pink-100 text-pink-800" },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 },
              }}
              className={`p-5 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col items-center`}
            >
              <p className={`text-sm font-medium ${item.color.split(" ")[1]} mb-1`}>
                {item.label}
              </p>
              {loading ? (
                <div className="h-6 w-10 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                <motion.span
                  className={`text-3xl font-bold ${item.color.split(" ")[1]}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  {item.value}
                </motion.span>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* 🔹 Enlaces principales */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {cards.map((card, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={card.to}
                className={`block bg-gradient-to-b ${card.color} dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center gap-4 mb-3">
                  {card.icon}
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {card.title}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {card.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
