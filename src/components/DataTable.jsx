import { useData } from '../contexts/DataContext'
import { useFilters } from '../contexts/FilterContext'
import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'

function DataTable() {
  const { data: ocorrencias, loading, error } = useData()
  const { filters } = useFilters()

  // Aplica os filtros nos dados
  const filteredData = useMemo(() => {
    if (!ocorrencias) return []

    return ocorrencias.filter(item => {
      // Filtro por data
      if (filters.dateRange.start || filters.dateRange.end) {
        const itemDate = parseISO(item.data)
        if (filters.dateRange.start) {
          const startDate = parseISO(filters.dateRange.start)
          if (itemDate < startDate) return false
        }
        if (filters.dateRange.end) {
          const endDate = parseISO(filters.dateRange.end)
          if (itemDate > endDate) return false
        }
      }

      // Filtro por situação
      if (filters.situacoes.length > 0) {
        if (!filters.situacoes.includes(item.situacao)) return false
      }

      // Filtro por colaborador
      if (filters.colaboradores.length > 0) {
        if (!filters.colaboradores.includes(item.id_colaborador)) return false
      }

      return true
    })
  }, [ocorrencias, filters])

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy')
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-neutral-50"></div>
          <span className="ml-3 text-neutral-600 dark:text-neutral-400">Carregando dados...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-red-200 dark:border-red-800 p-8">
        <div className="text-red-600 dark:text-red-400">
          <p className="font-semibold">Erro ao carregar dados:</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
      {/* Header da tabela com contador */}
      <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Registros de Ocorrências
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {filteredData.length} {filteredData.length === 1 ? 'registro encontrado' : 'registros encontrados'}
        </p>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Colaborador
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Horário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Início
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Término
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Total Horas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Situação
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id_registro} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-50">
                    {item.id_registro}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-50">
                    {item.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-50">
                    {formatDate(item.data)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                    {item.descricao_horario}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                    {item.inicio || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                    {item.termino || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                    {item.total_horas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {item.situacao}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  Nenhum registro encontrado com os filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
