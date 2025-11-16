import { createContext, useContext, useState } from 'react'

const SpecialFilterContext = createContext()

export function SpecialFilterProvider({ children }) {
  const [selectedEspeciais, setSelectedEspeciais] = useState([])

  const toggleEspecial = (especial) => {
    setSelectedEspeciais(prev =>
      prev.includes(especial)
        ? prev.filter(e => e !== especial)
        : [...prev, especial]
    )
  }

  const clearEspeciais = () => {
    setSelectedEspeciais([])
  }

  return (
    <SpecialFilterContext.Provider value={{
      selectedEspeciais,
      setSelectedEspeciais,
      toggleEspecial,
      clearEspeciais
    }}>
      {children}
    </SpecialFilterContext.Provider>
  )
}

export function useSpecialFilters() {
  const context = useContext(SpecialFilterContext)
  if (!context) {
    throw new Error('useSpecialFilters must be used within SpecialFilterProvider')
  }
  return context
}
