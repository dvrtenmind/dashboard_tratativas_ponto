import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useData } from '../contexts/DataContext'
import { useTableData } from '../hooks/useTableData'
import { exportTableToExcel } from '../utils/exportTableToExcel'

function OccurrencesTable() {
  const { data: ocorrencias } = useData()
  const {
    paginatedData,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    totalRecords,
    tableData
  } = useTableData()

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // Ordenação
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return paginatedData

    const sorted = [...paginatedData].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return sortConfig.direction === 'asc'
        ? aVal > bVal ? 1 : -1
        : aVal < bVal ? 1 : -1
    })

    return sorted
  }, [paginatedData, sortConfig])

  // Exportação
  const handleExport = () => {
    exportTableToExcel(tableData)
  }

  if (!ocorrencias || ocorrencias.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Sem dados disponíveis
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            Tabela de Ocorrências
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {totalRecords} registro{totalRecords !== 1 ? 's' : ''} encontrado{totalRecords !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Botão Exportar */}
        <button
          onClick={handleExport}
          disabled={totalRecords === 0}
          className="px-3 py-1.5 text-xs font-medium bg-neutral-700 dark:bg-neutral-600 text-white hover:bg-neutral-800 dark:hover:bg-neutral-500 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Exportar Excel
        </button>
      </div>

      {/* Tabela com rolagem fixa */}
      <div className="overflow-auto border border-neutral-200 dark:border-neutral-700 rounded" style={{ maxHeight: '1000px' }}>
        <table className="w-full text-xs">
          <thead className="bg-neutral-100 dark:bg-neutral-800 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-2 text-left font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700" onClick={() => handleSort('data')}>
                Data {sortConfig.key === 'data' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700" onClick={() => handleSort('nome')}>
                Colaborador {sortConfig.key === 'nome' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700" onClick={() => handleSort('situacao')}>
                Situação {sortConfig.key === 'situacao' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                Descrição Horário
              </th>
              <th className="px-2 py-2 text-left font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700" onClick={() => handleSort('total_horas_ocorrencia')}>
                Horas {sortConfig.key === 'total_horas_ocorrencia' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                Justificativa
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-2 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <td className="px-2 py-2 text-neutral-700 dark:text-neutral-300">
                    {item.data ? format(parseISO(item.data), 'dd/MM/yyyy') : '-'}
                  </td>
                  <td className="px-2 py-2 text-neutral-700 dark:text-neutral-300">
                    {item.nome || '-'}
                  </td>
                  <td className="px-2 py-2 text-neutral-700 dark:text-neutral-300">
                    {item.situacao || '-'}
                  </td>
                  <td className="px-2 py-2 text-neutral-700 dark:text-neutral-300">
                    {item.descricao_horario || '-'}
                  </td>
                  <td className="px-2 py-2 text-neutral-700 dark:text-neutral-300">
                    {item.total_horas_ocorrencia || '-'}
                  </td>
                  <td className="px-2 py-2 text-neutral-700 dark:text-neutral-300 max-w-xs truncate">
                    {item.justificativa || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Página {currentPage} de {totalPages} • Mostrando {pageSize} por página
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 dark:text-neutral-300"
            >
              Primeira
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 dark:text-neutral-300"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 dark:text-neutral-300"
            >
              Próxima
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 dark:text-neutral-300"
            >
              Última
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OccurrencesTable
