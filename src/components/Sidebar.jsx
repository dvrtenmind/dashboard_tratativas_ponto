import { useFilters } from '../contexts/FilterContext'
import { useSupabase } from '../hooks/useSupabase'
import { useState, useEffect } from 'react'

function Sidebar() {
  const { filters, updateDateRange, updateSituacoes, updateColaboradores, clearFilters } = useFilters()
  const { data: ocorrencias } = useSupabase()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [situacoesList, setSituacoesList] = useState([])
  const [colaboradoresList, setColaboradoresList] = useState([])
  const [searchColaborador, setSearchColaborador] = useState('')

  // Extrai valores únicos dos dados para os filtros
  useEffect(() => {
    if (ocorrencias && ocorrencias.length > 0) {
      // Situações únicas
      const uniqueSituacoes = [...new Set(ocorrencias.map(item => item.situacao).filter(Boolean))]
      setSituacoesList(uniqueSituacoes.sort())

      // Colaboradores únicos
      const uniqueColaboradores = [...new Set(ocorrencias.map(item => ({
        id: item.id_colaborador,
        nome: item.nome
      })).filter(c => c.id && c.nome).map(JSON.stringify))].map(JSON.parse)
      setColaboradoresList(uniqueColaboradores.sort((a, b) => a.nome.localeCompare(b.nome)))
    }
  }, [ocorrencias])

  const handleDateChange = () => {
    updateDateRange(startDate || null, endDate || null)
  }

  const toggleSituacao = (situacao) => {
    const newSituacoes = filters.situacoes.includes(situacao)
      ? filters.situacoes.filter(s => s !== situacao)
      : [...filters.situacoes, situacao]
    updateSituacoes(newSituacoes)
  }

  const toggleColaborador = (colaboradorId) => {
    const newColaboradores = filters.colaboradores.includes(colaboradorId)
      ? filters.colaboradores.filter(c => c !== colaboradorId)
      : [...filters.colaboradores, colaboradorId]
    updateColaboradores(newColaboradores)
  }

  const filteredColaboradores = colaboradoresList.filter(c =>
    c.nome.toLowerCase().includes(searchColaborador.toLowerCase())
  )

  return (
    <aside className="w-80 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full">
      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        {/* Título */}
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Filtros
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Refine sua busca
          </p>
        </div>

        {/* Filtro por Data */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Período
          </h3>
          <div className="space-y-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={handleDateChange}
              className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 text-neutral-900 dark:text-neutral-50"
              placeholder="Data inicial"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={handleDateChange}
              className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 text-neutral-900 dark:text-neutral-50"
              placeholder="Data final"
            />
          </div>
        </div>

        {/* Filtro por Situação/Ocorrência */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Situação
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {situacoesList.map(situacao => (
              <label key={situacao} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.situacoes.includes(situacao)}
                  onChange={() => toggleSituacao(situacao)}
                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-50">
                  {situacao}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtro por Colaborador */}
        <div className="space-y-3 pb-4">
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Colaborador
          </h3>
          <input
            type="text"
            value={searchColaborador}
            onChange={(e) => setSearchColaborador(e.target.value)}
            placeholder="Buscar colaborador..."
            className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 text-neutral-900 dark:text-neutral-50"
          />
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {filteredColaboradores.map(colaborador => (
              <label key={colaborador.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.colaboradores.includes(colaborador.id)}
                  onChange={() => toggleColaborador(colaborador.id)}
                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-50">
                  {colaborador.nome}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Botão Limpar Filtros */}
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
        >
          Limpar Filtros
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
