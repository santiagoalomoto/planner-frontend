import React, { useState } from 'react'

export default function Configuration() {
  const [settings, setSettings] = useState({
    academicYear: '2025',
    currentSemester: '1',
    notifications: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSave = () => {
    console.log('Guardando configuración...', settings)
    alert('✅ Configuración guardada correctamente')
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-4">⚙️ Configuración del Sistema</h1>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Año Académico</label>
          <input
            type="text"
            name="academicYear"
            value={settings.academicYear}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Semestre Actual</label>
          <select
            name="currentSemester"
            value={settings.currentSemester}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          >
            <option value="1">Semestre 1</option>
            <option value="2">Semestre 2</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="notifications"
            checked={settings.notifications}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm text-gray-700">Activar notificaciones</label>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  )
}
