import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download } from 'lucide-react'

export default function Table({ headers, data }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const rowsPerPage = 8

  // 🔍 Filtrar resultados
  const filtered = useMemo(() => {
    if (!search.trim()) return data
    return data.filter((row) =>
      row.some((cell) =>
        String(cell).toLowerCase().includes(search.toLowerCase())
      )
    )
  }, [data, search])

  // 📄 Paginación
  const totalPages = Math.ceil(filtered.length / rowsPerPage)
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  // 📤 Exportar CSV
  const exportCSV = () => {
    const csv = [
      headers.join(','),
      ...filtered.map((row) =>
        row
          .map((cell) =>
            typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
          )
          .join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'tabla_exportada.csv'
    link.click()
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border border-gray-100">
      {/* 🔍 Búsqueda y Exportar */}
      <div className="flex flex-wrap justify-between items-center mb-3 gap-3">
        <input
          type="text"
          placeholder="🔍 Buscar..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-200 focus:border-blue-500 w-full sm:w-64"
        />
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          title="Exportar a CSV"
        >
          <Download size={16} /> Exportar
        </button>
      </div>

      {/* 📋 Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="p-3 text-left border-b">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <AnimatePresence>
            <motion.tbody
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="text-center text-gray-500 py-5 italic"
                  >
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition text-sm text-gray-700 border-b"
                  >
                    {row.map((cell, j) => (
                      <td key={j} className="p-3 align-top">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </div>

      {/* 📄 Paginación */}
      <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
        <span>
          Página {page} de {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded-lg border ${
              page === 1
                ? 'text-gray-400 border-gray-200'
                : 'hover:bg-blue-50 hover:text-blue-700 border-gray-300'
            }`}
          >
            ⬅ Anterior
          </button>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
            className={`px-3 py-1 rounded-lg border ${
              page === totalPages || totalPages === 0
                ? 'text-gray-400 border-gray-200'
                : 'hover:bg-blue-50 hover:text-blue-700 border-gray-300'
            }`}
          >
            Siguiente ➡
          </button>
        </div>
      </div>
    </div>
  )
}
