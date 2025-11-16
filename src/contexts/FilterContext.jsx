import { createContext, useContext, useState } from 'react'

const FilterContext = createContext()

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    situacoes: [],
    colaboradores: []
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

  const clearFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      situacoes: [],
      colaboradores: []
    })
  }

  return (
    <FilterContext.Provider value={{
      filters,
      updateDateRange,
      updateSituacoes,
      updateColaboradores,
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
