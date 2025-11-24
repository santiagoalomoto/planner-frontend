import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { 
  BarChart3, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar,
  Clock,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react'

export default function Reports() {
  const [summary, setSummary] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    semesters: 0,
    schedules: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [stRes, tRes, cRes, seRes, rRes, teRes] = await Promise.all([
        api.get('/students'),
        api.get('/teachers'),
        api.get('/courses'),
        api.get('/semesters'),
        api.get('/schedules/rooms'),
        api.get('/schedules/teachers'),
      ])

      const totalSchedules = rRes.data.length + teRes.data.length

      setSummary({
        students: stRes.data.length,
        teachers: tRes.data.length,
        courses: cRes.data.length,
        semesters: seRes.data.length,
        schedules: totalSchedules,
      })
    } catch (err) {
      console.error('❌ Error al cargar reportes:', err)
    } finally {
      setLoading(false)
    }
  }

  const chartData = [
    { name: 'Estudiantes', total: summary.students },
    { name: 'Docentes', total: summary.teachers },
    { name: 'Cursos', total: summary.courses },
    { name: 'Semestres', total: summary.semesters },
    { name: 'Horarios', total: summary.schedules },
  ]

  // Stats config para diseño premium
  const statsConfig = [
    {
      label: 'Estudiantes',
      value: summary.students,
      icon: GraduationCap,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-500'
    },
    {
      label: 'Docentes',
      value: summary.teachers,
      icon: Users,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      iconBg: 'bg-orange-500'
    },
    {
      label: 'Cursos',
      value: summary.courses,
      icon: BookOpen,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-500'
    },
    {
      label: 'Semestres',
      value: summary.semesters,
      icon: Calendar,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      iconBg: 'bg-purple-500'
    },
    {
      label: 'Horarios',
      value: summary.schedules,
      icon: Clock,
      gradient: 'from-pink-500 to-pink-600',
      bgGradient: 'from-pink-50 to-pink-100',
      borderColor: 'border-pink-200',
      iconBg: 'bg-pink-500'
    }
  ]

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
          <div className="h-8 bg-slate-200 rounded w-16"></div>
        </div>
        <div className="w-14 h-14 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="text-white" size={20} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Reportes Generales</h1>
          </div>
          <p className="text-slate-600 ml-13">Visualiza las estadísticas del sistema YAVIRAC</p>
        </div>

        {/* Skeleton Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
        </div>

        {/* Skeleton Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
          <div className="h-80 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      {/* Header Premium */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="text-white" size={20} />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">Reportes Generales</h1>
            </div>
            <p className="text-slate-600 ml-13">Visualiza las estadísticas del sistema YAVIRAC</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-slate-700 font-medium"
            >
              <RefreshCw size={18} />
              <span>Actualizar</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
              <Download size={18} />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`group bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 border ${stat.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.label}
                  </p>
                  <h2 className="text-3xl font-bold text-slate-800 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </h2>
                </div>
                <div className={`w-14 h-14 ${stat.iconBg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart Section Premium */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Distribución General</h2>
              <p className="text-sm text-slate-500">Análisis comparativo del sistema</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-slate-600">Total</span>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar 
                dataKey="total" 
                fill="url(#colorBar)" 
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
            <TrendingUp className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Resumen del Sistema</h3>
            <p className="text-sm text-slate-600">
              Total de {summary.students + summary.teachers + summary.courses + summary.semesters + summary.schedules} registros activos en la plataforma YAVIRAC
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}