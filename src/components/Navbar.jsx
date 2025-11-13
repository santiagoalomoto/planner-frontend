import React, { useContext, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-600 text-white shadow-md scale-[1.02]'
        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
    }`

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { title: '🏠 Inicio', to: '/dashboard' },
    { section: 'Gestión Académica' },
    { title: '📆 Semestres', to: '/dashboard/semesters' },
    { title: '📘 Cursos', to: '/dashboard/courses' },
    { title: '🎓 Ofertas de Curso', to: '/dashboard/offerings' },
    { title: '🧩 Secciones', to: '/dashboard/sections' },
    { title: '👨‍🎓 Asignaciones', to: '/dashboard/student-sections' },
    { title: '📝 Inscripciones', to: '/dashboard/enrollments' },
    { section: 'Personal y Estudiantes' },
    { title: '👨‍🏫 Docentes', to: '/dashboard/teachers' },
    { title: '🎓 Estudiantes', to: '/dashboard/students' },
    { title: '👤 Usuarios', to: '/dashboard/users' },
    { section: 'Infraestructura' },
    { title: '🏫 Aulas', to: '/dashboard/rooms' },
    { title: '⏰ Franjas Horarias', to: '/dashboard/timeslots' },
    { title: '🕒 Horarios', to: '/dashboard/schedules' },
    { section: 'Control y Administración' },
    { title: '📊 Reportes', to: '/dashboard/reports' },
    { title: '⚠️ Conflictos', to: '/dashboard/conflicts' },
    { title: '🧾 Auditoría', to: '/dashboard/audit-logs' },
    { title: '⚙️ Configuración', to: '/dashboard/settings' },
  ]

  return (
    <>
      {/* 🔹 Botón hamburguesa (solo móvil) */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white shadow-sm z-40 flex justify-between items-center px-4 py-3">
        <h2 className="text-lg font-bold text-blue-700">Planificación Académica</h2>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-md text-gray-600 hover:bg-blue-50 transition"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 🔹 Sidebar (desktop + móvil animado) */}
      <AnimatePresence>
        {(open || window.innerWidth >= 1024) && (
          <motion.aside
            key="sidebar"
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.25 }}
            className={`fixed lg:static z-50 top-0 left-0 bg-white w-64 min-h-screen shadow-lg flex flex-col justify-between border-r border-gray-200 ${
              open ? 'block' : 'hidden lg:flex'
            }`}
          >
            <div>
              {/* Encabezado solo visible en desktop */}
              <div className="hidden lg:block px-5 py-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
                <h2 className="text-2xl font-bold text-blue-700 leading-tight">
                  Planificación Académica
                </h2>
                <p className="text-xs text-gray-500">Panel Administrativo</p>
              </div>

              {/* Navegación */}
              <nav className="mt-4 space-y-1 px-2 overflow-y-auto max-h-[75vh] pb-8">
                {navLinks.map((link, i) =>
                  link.section ? (
                    <p
                      key={i}
                      className="text-xs text-gray-400 mt-4 mb-1 px-2 uppercase tracking-wider"
                    >
                      {link.section}
                    </p>
                  ) : (
                    <NavLink key={i} to={link.to} className={linkClass}>
                      {link.title}
                    </NavLink>
                  )
                )}
              </nav>
            </div>

            {/* Footer / Logout */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => {
                  handleLogout()
                  setOpen(false)
                }}
                className="flex items-center justify-center w-full px-3 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <LogOut size={16} className="mr-2" /> Cerrar sesión
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 🔹 Fondo oscuro al abrir menú móvil */}
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </>
  )
}
