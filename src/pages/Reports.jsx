import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

      {/* Totales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white shadow rounded p-4 text-center">
          <p className="text-gray-500">Estudiantes</p>
          <h2 className="text-2xl font-bold">{summary.students}</h2>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <p className="text-gray-500">Docentes</p>
          <h2 className="text-2xl font-bold">{summary.teachers}</h2>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <p className="text-gray-500">Cursos</p>
          <h2 className="text-2xl font-bold">{summary.courses}</h2>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <p className="text-gray-500">Semestres</p>
          <h2 className="text-2xl font-bold">{summary.semesters}</h2>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <p className="text-gray-500">Horarios</p>
          <h2 className="text-2xl font-bold">{summary.schedules}</h2>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">Distribución General</h2>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
