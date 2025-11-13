import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default function Table({ headers, data, title = 'Reporte de Datos' }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const rowsPerPage = 8

  // 🔍 Filtro de búsqueda
  const filtered = useMemo(() => {
    if (!search.trim()) return data
    return data.filter((row) =>
      row.some((cell) =>
        String(cell).toLowerCase().includes(search.toLowerCase())
      )
    )
  }, [data, search])

  const totalPages = Math.ceil(filtered.length / rowsPerPage)
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  // 🕒 Generar fecha formateada
  const getFormattedDate = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}-${String(
      d.getMinutes()
    ).padStart(2, '0')}`
  }

  // 📊 Exportar Excel (solo datos legibles para usuario)
  const exportExcel = () => {
    if (!filtered.length) {
      alert('No hay datos para exportar.')
      return
    }

    // 🔹 Convertir los datos eliminando objetos y botones
    const cleanedData = filtered.map((row) =>
      row.map((cell) => {
        if (React.isValidElement(cell)) return '' // Quita botones o íconos
        if (typeof cell === 'object' && cell !== null) return JSON.stringify(cell)
        return String(cell)
      })
    )

    // 🔹 Crear hoja
    const worksheetData = [headers, ...cleanedData]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // 🧭 Ajustar ancho dinámico
    const colWidths = headers.map((h, i) => ({
      wch: Math.max(
        h.length + 4,
        ...cleanedData.map((row) => String(row[i] || '').length + 2)
      ),
    }))
    worksheet['!cols'] = colWidths

    // 🎨 Estilo básico (bordes + encabezado azul)
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
        if (!worksheet[cellRef]) continue
        worksheet[cellRef].s = {
          border: {
            top: { style: 'thin', color: { rgb: 'CCCCCC' } },
            left: { style: 'thin', color: { rgb: 'CCCCCC' } },
            bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
            right: { style: 'thin', color: { rgb: 'CCCCCC' } },
          },
        }
      }
    }

    // 🏷️ Encabezado con estilo (azul + negrita)
    headers.forEach((_, i) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i })
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '2563EB' } }, // azul
          alignment: { horizontal: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'FFFFFF' } },
            bottom: { style: 'thin', color: { rgb: 'FFFFFF' } },
          },
        }
      }
    })

    // 📘 Crear libro
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')

    // 🕒 Nombre amigable
    const filename = `${title.replace(/\s+/g, '_')}_${getFormattedDate()}.xlsx`

    // 💾 Descargar
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, filename)
  }

  return (
    <div className="p-5 bg-white rounded-2xl shadow-md border border-gray-100">
      {/* 🔍 Búsqueda y Exportar */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
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
          onClick={exportExcel}
          className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-300 rounded-lg text-sm text-green-700 hover:bg-green-100 transition"
          title="Exportar a Excel"
        >
          <FileSpreadsheet size={18} /> Exportar Excel
        </button>
      </div>

      {/* ℹ️ Info de resultados */}
      <div className="text-sm text-gray-500 mb-2">
        {filtered.length === data.length
          ? `Total de registros: ${data.length}`
          : `${filtered.length} resultados encontrados de ${data.length}`}
      </div>

      {/* 📋 Tabla */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase sticky top-0">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="p-3 text-left border-b border-gray-200 font-semibold"
                >
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
                    className="text-center text-gray-500 py-6 italic"
                  >
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-green-50/40 transition text-sm text-gray-700 border-b border-gray-100"
                  >
                    {row.map((cell, j) => (
                      <td key={j} className="p-3 align-top break-words max-w-[250px]">
                        {typeof cell === 'string' && cell.length > 100
                          ? cell.slice(0, 97) + '...'
                          : cell}
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
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>
          Página <b>{page}</b> de <b>{totalPages || 1}</b>
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded-lg border ${
              page === 1
                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                : 'hover:bg-green-50 hover:text-green-700 border-gray-300'
            }`}
          >
            ⬅ Anterior
          </button>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
            className={`px-3 py-1 rounded-lg border ${
              page === totalPages || totalPages === 0
                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                : 'hover:bg-green-50 hover:text-green-700 border-gray-300'
            }`}
          >
            Siguiente ➡
          </button>
        </div>
      </div>
    </div>
  )
}
