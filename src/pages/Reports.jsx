import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { Loader2, AlertTriangle } from 'lucide-react'

export default function Reports() {
  const [summary, setSummary] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    semesters: 0,
    schedules: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [stRes, tRes, cRes, seRes, srRes] = await Promise.all([
        api.get('/students'),
        api.get('/teachers'),
        api.get('/courses'),
        api.get('/semesters'),
        api.get('/schedules/rooms'),
      ])

      setSummary({
        students: stRes.data.length || 0,
        teachers: tRes.data.length || 0,
        courses: cRes.data.length || 0,
        semesters: seRes.data.length || 0,
        schedules: srRes.data.length || 0,
      })
    } catch (err) {
      console.error('❌ Error al cargar reportes:', err)
      setError('No se pudieron cargar los datos. Intenta nuevamente más tarde.')
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-blue-600">
        <Loader2 className="animate-spin w-8 h-8 mb-2" />
        <p className="text-gray-500">Cargando datos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-600">
        <AlertTriangle className="w-8 h-8 mb-2" />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 animate-fadeIn">
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <h1 className="text-3xl font-bold text-blue-700">📈 Reportes Generales</h1>
        <button
          onClick={loadData}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md shadow-sm transition"
        >
          🔄 Actualizar Datos
        </button>
      </motion.div>

      {/* Tarjetas de totales */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {[
          { label: 'Estudiantes', value: summary.students, color: 'bg-green-100 text-green-700' },
          { label: 'Docentes', value: summary.teachers, color: 'bg-purple-100 text-purple-700' },
          { label: 'Cursos', value: summary.courses, color: 'bg-orange-100 text-orange-700' },
          { label: 'Semestres', value: summary.semesters, color: 'bg-blue-100 text-blue-700' },
          { label: 'Horarios', value: summary.schedules, color: 'bg-pink-100 text-pink-700' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className={`p-5 rounded-xl shadow-md bg-white border border-gray-200 hover:shadow-lg hover:scale-[1.03] transition-transform`}
          >
            <p className="text-gray-500 text-sm mb-1">{item.label}</p>
            <h2 className={`text-3xl font-bold ${item.color}`}>{item.value}</h2>
          </motion.div>
        ))}
      </motion.div>

      {/* Gráfico de barras */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white shadow-md rounded-xl p-6 border border-gray-100"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800">📊 Distribución General</h2>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 12 }} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  border: '1px solid #ddd',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Bar
                dataKey="total"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}
