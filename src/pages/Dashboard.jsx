import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  GraduationCap,
  Users,
  BookOpen,
  Building2,
  Clock,
  BarChart3,
  FileText,
  Settings,
  ArrowRight,
  Sparkles,
  Target,
  Eye,
} from "lucide-react";

export default function Dashboard() {
  const quickActions = [
    {
      to: "/dashboard/semesters",
      icon: Calendar,
      title: "Semestres",
      description: "Gestiona los semestres académicos y sus periodos",
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/20",
    },
    {
      to: "/dashboard/students",
      icon: GraduationCap,
      title: "Estudiantes",
      description: "Administra la información de estudiantes registrados",
      gradient: "from-orange-500 to-orange-600",
      shadow: "shadow-orange-500/20",
    },
    {
      to: "/dashboard/teachers",
      icon: Users,
      title: "Docentes",
      description: "Gestiona los datos y asignaciones de profesores",
      gradient: "from-blue-600 to-blue-700",
      shadow: "shadow-blue-600/20",
    },
    {
      to: "/dashboard/courses",
      icon: BookOpen,
      title: "Cursos",
      description: "Crea y administra los cursos académicos disponibles",
      gradient: "from-slate-600 to-slate-700",
      shadow: "shadow-slate-500/20",
    },
    {
      to: "/dashboard/rooms",
      icon: Building2,
      title: "Salas",
      description: "Gestión de aulas y espacios académicos",
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/20",
    },
    {
      to: "/dashboard/schedules",
      icon: Clock,
      title: "Horarios",
      description: "Planificación y asignación de horarios",
      gradient: "from-orange-500 to-orange-600",
      shadow: "shadow-orange-500/20",
    },
    {
      to: "/dashboard/reports",
      icon: BarChart3,
      title: "Reportes",
      description: "Análisis y reportes académicos",
      gradient: "from-blue-600 to-blue-700",
      shadow: "shadow-blue-600/20",
    },
    {
      to: "/dashboard/audit-logs",
      icon: FileText,
      title: "Auditoría",
      description: "Registro de actividades del sistema",
      gradient: "from-slate-600 to-slate-700",
      shadow: "shadow-slate-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Section Premium */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Sparkles className="text-orange-300" size={24} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  ¡Bienvenido al Sistema YAVIRAC!
                </h1>
                <p className="text-blue-100 text-sm mt-1">Instituto Tecnológico Superior de Turismo y Patrimonio</p>
              </div>
            </div>

            {/* Quote Section */}
            <div className="mt-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-3xl">
              <div className="flex items-start gap-4">
                <div className="text-orange-300 text-5xl leading-none">"</div>
                <div>
                  <p className="text-white/90 text-lg italic leading-relaxed mb-3">
                    La educación es el arma más poderosa que puedes usar para cambiar el mundo.
                  </p>
                  <p className="text-blue-200 text-sm font-medium">— Nelson Mandela</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Mission Card */}
          <div className="group bg-white rounded-2xl p-8 shadow-lg border border-blue-100 hover:shadow-xl hover:border-blue-300 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="text-white" size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl font-bold text-slate-800">Nuestra Misión</h2>
                  <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full"></div>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Formar profesionales de excelencia enfocados en{" "}
                  <span className="font-semibold text-blue-600">Ciencia, Tecnología y Sociedad</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Vision Card */}
          <div className="group bg-white rounded-2xl p-8 shadow-lg border border-orange-100 hover:shadow-xl hover:border-orange-300 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Eye className="text-white" size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl font-bold text-slate-800">Nuestra Visión</h2>
                  <div className="h-1 w-12 bg-gradient-to-r from-orange-600 to-blue-500 rounded-full"></div>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Al 2027 el Instituto Superior Tecnológico de Turismo y Patrimonio Yavirac será una{" "}
                  <span className="font-semibold text-orange-600">institución de vanguardia</span> en la formación tecnológica y conservación del patrimonio.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Title */}
        <div className="flex items-center gap-3 pt-4">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-600 to-orange-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-slate-800">Acciones Rápidas</h2>
        </div>

        {/* Quick Actions Grid Premium */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.to}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg ${action.shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {action.description}
                  </p>

                  <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all duration-300">
                    <span>Acceder</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="bg-gradient-to-r from-slate-100 to-blue-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Settings className="text-slate-500" size={20} />
              <p className="text-slate-600 text-sm">
                Sistema de gestión académica diseñado para la excelencia educativa
              </p>
            </div>
            <Link
              to="/dashboard/settings"
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Configuración
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}