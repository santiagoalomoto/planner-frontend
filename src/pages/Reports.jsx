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
} from 'recharts'

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
    try {
      // ✅ Usa rutas reales del backend
      const [stRes, tRes, cRes, seRes, scRoomRes, scTeacherRes] = await Promise.all([
        api.get('/students'),
        api.get('/teachers'),
        api.get('/courses'),
        api.get('/semesters'),
        api.get('/schedules/rooms'),
        api.get('/schedules/teachers'),
      ])

      const totalSchedules = (scRoomRes.data?.length || 0) + (scTeacherRes.data?.length || 0)

      setSummary({
        students: stRes.data.length || 0,
        teachers: tRes.data.length || 0,
        courses: cRes.data.length || 0,
        semesters: seRes.data.length || 0,
        schedules: totalSchedules,
      })
    } catch (err) {
      console.error('❌ Error al cargar reportes:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p className="p-6">Cargando datos...</p>

  const chartData = [
    { name: 'Estudiantes', total: summary.students },
    { name: 'Docentes', total: summary.teachers },
    { name: 'Cursos', total: summary.courses },
    { name: 'Semestres', total: summary.semesters },
    { name: 'Horarios', total: summary.schedules },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-4">📈 Reportes Generales</h1>

      {/* Tarjetas de totales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Estudiantes', value: summary.students },
          { label: 'Docentes', value: summary.teachers },
          { label: 'Cursos', value: summary.courses },
          { label: 'Semestres', value: summary.semesters },
          { label: 'Horarios', value: summary.schedules },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white shadow-md rounded-xl p-5 text-center hover:shadow-lg transition"
          >
            <p className="text-gray-500">{item.label}</p>
            <h2 className="text-3xl font-bold text-blue-600">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Distribución General</h2>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
