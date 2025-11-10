import React, { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

export default function Navbar() {
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-lg text-sm transition ${
      isActive
        ? 'bg-blue-600 text-white font-semibold'
        : 'text-gray-700 hover:bg-blue-100'
    }`

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="bg-white w-64 min-h-screen shadow-md flex flex-col justify-between">
      <div>
        <div className="px-4 py-6 border-b">
          <h2 className="text-2xl font-bold text-blue-600">Planner</h2>
          <p className="text-xs text-gray-500">Panel Administrativo</p>
        </div>

        <nav className="mt-4 space-y-1 px-2">
          <NavLink to="/dashboard" className={linkClass}>
            🏠 Inicio
          </NavLink>

          <p className="text-xs text-gray-400 mt-4 mb-1 px-2 uppercase">
            Gestión Académica
          </p>

          <NavLink to="/dashboard/semesters" className={linkClass}>
            📆 Semestres
          </NavLink>
          <NavLink to="/dashboard/courses" className={linkClass}>
            📘 Cursos
          </NavLink>
          <NavLink to="/dashboard/offerings" className={linkClass}>
            🎓 Ofertas de Curso
          </NavLink>
          <NavLink to="/dashboard/sections" className={linkClass}>
            🧩 Secciones
          </NavLink>
          <NavLink to="/dashboard/student-sections" className={linkClass}>
            👨‍🎓 Asignaciones
          </NavLink>

          {/* ✅ Nuevo enlace agregado */}
          <NavLink to="/dashboard/enrollments" className={linkClass}>
            📝 Inscripciones
          </NavLink>

          <p className="text-xs text-gray-400 mt-4 mb-1 px-2 uppercase">
            Personal y Estudiantes
          </p>

          <NavLink to="/dashboard/teachers" className={linkClass}>
            👨‍🏫 Docentes
          </NavLink>
          <NavLink to="/dashboard/students" className={linkClass}>
            🎓 Estudiantes
          </NavLink>
          <NavLink to="/dashboard/users" className={linkClass}>
            👤 Usuarios
          </NavLink>

          <p className="text-xs text-gray-400 mt-4 mb-1 px-2 uppercase">
            Infraestructura
          </p>

          <NavLink to="/dashboard/rooms" className={linkClass}>
            🏫 Aulas
          </NavLink>
          <NavLink to="/dashboard/timeslots" className={linkClass}>
            ⏰ Franjas Horarias
          </NavLink>
          <NavLink to="/dashboard/schedules" className={linkClass}>
            🕒 Horarios
          </NavLink>

          <p className="text-xs text-gray-400 mt-4 mb-1 px-2 uppercase">
            Control y Administración
          </p>

          <NavLink to="/dashboard/reports" className={linkClass}>
            📊 Reportes
          </NavLink>
          <NavLink to="/dashboard/conflicts" className={linkClass}>
            ⚠️ Conflictos
          </NavLink>

          {/* 🧾 Ruta de Auditoría agregada sin modificar nada más */}
          <NavLink to="/dashboard/audit-logs" className={linkClass}>
            🧾 Auditoría
          </NavLink>

          <NavLink to="/dashboard/settings" className={linkClass}>
            ⚙️ Configuración
          </NavLink>
        </nav>
      </div>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition"
        >
          <LogOut size={16} className="mr-2" /> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
