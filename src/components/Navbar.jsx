import React, { useContext, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LogOut, 
  Home, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Building2, 
  Clock, 
  MapPin, 
  BarChart3, 
  AlertTriangle, 
  FileText, 
  Settings,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  School
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

export default function Navbar() {
  const { logout, user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [isCompact, setIsCompact] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    "Gestión Académica": true,
    "Personal": true,
    "Infraestructura": true,
    "Administración": true
  })

  const toggleSection = (sectionTitle) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }))
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 group ${
      isActive
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 font-semibold'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-md'
    }`

  const compactLinkClass = ({ isActive }) =>
    `flex items-center justify-center p-3 rounded-xl text-sm transition-all duration-300 group relative ${
      isActive
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    }`

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuSections = [
    {
      title: "Principal",
      icon: Home,
      items: [
        { to: "/dashboard", icon: Home, label: "Inicio" }
      ]
    },
    {
      title: "Gestión Académica",
      icon: BookOpen,
      items: [
        { to: "/dashboard/semesters", icon: Calendar, label: "Semestres" },
        { to: "/dashboard/courses", icon: BookOpen, label: "Cursos" },
        { to: "/dashboard/offerings", icon: GraduationCap, label: "Ofertas" },
        { to: "/dashboard/sections", icon: Users, label: "Secciones" },
        { to: "/dashboard/student-sections", icon: Users, label: "Asignaciones" },
        { to: "/dashboard/enrollments", icon: FileText, label: "Inscripciones" }
      ]
    },
    {
      title: "Personal",
      icon: Users,
      items: [
        { to: "/dashboard/teachers", icon: Users, label: "Docentes" },
        { to: "/dashboard/students", icon: GraduationCap, label: "Estudiantes" },
        { to: "/dashboard/users", icon: Users, label: "Usuarios" }
      ]
    },
    {
      title: "Infraestructura",
      icon: Building2,
      items: [
        { to: "/dashboard/rooms", icon: Building2, label: "Salas" },
        { to: "/dashboard/timeslots", icon: Clock, label: "Franjas Horarias" },
        { to: "/dashboard/schedules", icon: Clock, label: "Horarios" },
      ]
    },
    {
      title: "Administración",
      icon: BarChart3,
      items: [
        { to: "/dashboard/reports", icon: BarChart3, label: "Reportes" },
        { to: "/dashboard/conflicts", icon: AlertTriangle, label: "Conflictos" },
        { to: "/dashboard/audit-logs", icon: FileText, label: "Auditoría" },
        { to: "/dashboard/settings", icon: Settings, label: "Configuración" }
      ]
    }
  ]

  return (
    <aside className={`bg-white min-h-screen shadow-xl border-r border-slate-200 flex flex-col justify-between transition-all duration-300 ${
      isCompact ? 'w-20' : 'w-80'
    }`}>
      {/* Header */}
      <div className="px-6 py-8 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-3 transition-all duration-300 ${
            isCompact ? 'justify-center w-full' : ''
          }`}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <School className="text-white" size={24} />
            </div>
            {!isCompact && (
              <div className="overflow-hidden transition-all duration-300">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent whitespace-nowrap">
                  Sistema de Planificación
                </h2>
                <p className="text-xs text-slate-600 font-medium whitespace-nowrap">
                  YAVIRAC ISTTP
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCompact(!isCompact)}
          className={`w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-blue-400 transition-all duration-200 ${
            isCompact ? 'justify-center' : 'justify-between'
          }`}
        >
          {!isCompact && <span className="text-sm font-medium">Menú compacto</span>}
          {isCompact ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* User Info */}
        {!isCompact && user && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-slate-300 shadow-sm">
            <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
            <p className="text-xs text-slate-600 truncate">{user.role}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1 px-3">
          {menuSections.map((section, index) => {
            const isExpanded = expandedSections[section.title]
            const hasItems = section.items.length > 1
            
            return (
              <div key={index}>
                {isCompact ? (
                  <div className="relative">
                    <button
                      onClick={() => hasItems && toggleSection(section.title)}
                      className={`flex items-center justify-center p-3 w-full rounded-xl transition-all duration-300 group relative ${
                        hasItems 
                          ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                          : 'text-slate-700'
                      }`}
                    >
                      <section.icon size={20} />
                      {/* Indicador visual para desplegable */}
                      {hasItems && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      {/* Tooltip para modo compacto */}
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                        {section.title}
                      </div>
                    </button>
                    
                    {/* Expanded submenu en modo compacto */}
                    {isExpanded && hasItems && (
                      <div className="absolute left-full top-0 ml-1 bg-white rounded-xl shadow-xl border border-slate-300 py-2 min-w-48 z-40">
                        <div className="px-3 py-2 border-b border-slate-200">
                          <p className="text-xs font-semibold text-slate-600 uppercase">
                            {section.title}
                          </p>
                        </div>
                        {section.items.map((item, itemIndex) => {
                          const Icon = item.icon
                          return (
                            <NavLink
                              key={itemIndex}
                              to={item.to}
                              className={({ isActive }) => 
                                `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm transition-all duration-200 ${
                                  isActive
                                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                }`
                              }
                            >
                              <Icon size={18} />
                              <span>{item.label}</span>
                            </NavLink>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Sección con indicador visual claro de desplegable */}
                    <div className={`flex items-center justify-between w-full px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider transition-all duration-300 cursor-pointer group ${
                      hasItems ? 'hover:bg-slate-100 hover:text-slate-800 rounded-xl' : ''
                    }`}
                    onClick={() => hasItems && toggleSection(section.title)}
                    >
                      <span className="flex items-center gap-2">
                        <section.icon size={16} className="text-slate-500" />
                        {section.title}
                      </span>
                      
                      {/* Indicador visual mejorado para desplegable */}
                      {hasItems && (
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 bg-blue-500 rounded-full transition-all duration-300 ${
                            isExpanded ? 'opacity-100' : 'opacity-60'
                          }`}></div>
                          <ChevronDown 
                            size={14} 
                            className={`text-slate-500 transition-transform duration-300 ${
                              isExpanded ? 'rotate-180 text-blue-500' : 'group-hover:text-slate-700'
                            }`} 
                          />
                        </div>
                      )}
                    </div>

                    {/* Items de la sección */}
                    <div className={`space-y-1 transition-all duration-300 overflow-hidden ${
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      {section.items.map((item, itemIndex) => {
                        const Icon = item.icon
                        return (
                          <NavLink
                            key={itemIndex}
                            to={item.to}
                            className={linkClass}
                          >
                            <div className="w-8 h-8 flex items-center justify-center bg-slate-100 group-hover:bg-blue-100 group-[.active]:bg-white/20 rounded-lg transition-colors">
                              <Icon size={18} className="text-slate-600 group-hover:text-slate-800" />
                            </div>
                            <span className="flex-1 text-slate-700">{item.label}</span>
                            <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform" />
                          </NavLink>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-300 bg-slate-50/50">
        {/* Logout Button */}
        {isCompact ? (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-3 w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/25 relative group"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Cerrar sesión
            </div>
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/25 hover:-translate-y-0.5"
          >
            <LogOut size={18} className="mr-3" /> 
            Cerrar sesión
          </button>
        )}
        
        {/* Version Info */}
        {!isCompact && (
          <div className="mt-3 text-center">
            <p className="text-xs text-slate-500">
              v2.1.0 • YAVIRAC ISTTP
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}