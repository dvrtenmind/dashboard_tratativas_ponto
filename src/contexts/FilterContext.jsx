import { createContext, useContext, useState } from 'react'

const FilterContext = createContext()

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    situacoes: [],
    colaboradores: [],
    matriculas: ''
  })

  const updateDateRange = (start, end) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end }
    }))
  }

  const updateSituacoes = (situacoes) => {
    setFilters(prev => ({
      ...prev,
      situacoes
    }))
  }

  const updateColaboradores = (colaboradores) => {
    setFilters(prev => ({
      ...prev,
      colaboradores
    }))
  }

  const updateMatriculas = (matriculas) => {
    setFilters(prev => ({
      ...prev,
      matriculas
    }))
  }

  const toggleSituacao = (situacao) => {
    setFilters(prev => {
      const isSelected = prev.situacoes.includes(situacao)
      return {
        ...prev,
        situacoes: isSelected
          ? prev.situacoes.filter(s => s !== situacao)
          : [...prev.situacoes, situacao]
      }
    })
  }

  const clearFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      situacoes: [],
      colaboradores: [],
      matriculas: ''
    })
  }

  return (
    <FilterContext.Provider value={{
      filters,
      updateDateRange,
      updateSituacoes,
      updateColaboradores,
      updateMatriculas,
      toggleSituacao,
      clearFilters
    }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider')
  }
  return context
}
