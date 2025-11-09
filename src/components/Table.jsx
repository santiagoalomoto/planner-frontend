import React from 'react'

export default function Table({ headers = [], data = [], loading = false }) {
  // Si aún está cargando
  if (loading) {
    return (
      <div className="text-center py-6 text-gray-500">
        Cargando datos...
      </div>
    )
  }

  // Si no hay datos
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No hay registros para mostrar.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="text-left px-4 py-2 border-b text-gray-700 font-semibold"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 border-b text-sm text-gray-600">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
