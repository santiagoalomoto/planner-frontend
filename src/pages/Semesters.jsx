// src/pages/Semesters.jsx
import React, { useEffect, useState } from 'react'
import api from '../api/axiosConfig'
import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'

export default function Semesters() {
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [year, setYear] = useState('')

  // Cargar semestres
  const fetchSemesters = async () => {
    setLoading(true)
    try {
      const res = await api.get('/semesters')
      setSemesters(res.data)
    } catch (err) {
      console.error('Error al obtener semestres:', err.response?.data || err)
      alert('No se pudieron cargar los semestres.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSemesters()
  }, [])

  // Crear semestre
  const createSemester = async (e) => {
    e.preventDefault()
    if (!name || !year) return

    try {
      const res = await api.post('/semesters', {
        name,
        start_date: `${year}-01-01`,
        end_date: `${year}-06-30`,
        status: 'active'
      })
      console.log('Semestre creado:', res.data)
      setShowModal(false)
      setName('')
      setYear('')
      fetchSemesters()
    } catch (err) {
      console.error('Error al crear semestre:', err.response?.data || err)
      alert(`No se pudo crear el semestre. Error: ${err.response?.data?.message || err.message}`)
    }
  }

  // Badge para estado
  const renderStatus = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 rounded bg-green-500 text-white text-sm">Activo</span>
      case 'draft':
        return <span className="px-2 py-1 rounded bg-yellow-500 text-white text-sm">Borrador</span>
      default:
        return <span className="px-2 py-1 rounded bg-gray-400 text-white text-sm">{status}</span>
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Gestión de Semestres</h2>
        <Button onClick={() => setShowModal(true)}>+ Nuevo Semestre</Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          headers={['Nombre', 'Fechas', 'Estado']}
          data={semesters.map(s => [
            s.name,
            `${s.start_date?.split('T')[0] || ''} → ${s.end_date?.split('T')[0] || ''}`,
            renderStatus(s.status || 'draft')
          ])}
        />
      )}

      {/** Modal corregido */}
      <Modal
        open={showModal} // ✅ ahora pasamos el prop open
        title="Nuevo Semestre"
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={createSemester} className="space-y-3">
          <input
            className="w-full border p-2 rounded"
            placeholder="Nombre del semestre"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Año (ej. 2025)"
            value={year}
            onChange={e => setYear(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Guardar
          </Button>
        </form>
      </Modal>
    </div>
  )
}
