import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, TABLE_NAME } from '../utils/supabaseClient'

const DataContext = createContext()

export function DataProvider({ children }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Busca todos os registros sem limite
      let allData = []
      let from = 0
      const batchSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data: batch, error: fetchError } = await supabase
          .from(TABLE_NAME)
          .select('*')
          .order('data', { ascending: false })
          .order('id_registro', { ascending: false })
          .range(from, from + batchSize - 1)

        if (fetchError) {
          throw fetchError
        }

        if (batch && batch.length > 0) {
          allData = [...allData, ...batch]
          from += batchSize
          hasMore = batch.length === batchSize
        } else {
          hasMore = false
        }
      }

      setData(allData)
    } catch (err) {
      console.error('Erro ao buscar dados:', err)
      setError(err.message || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    fetchData()
  }

  return (
    <DataContext.Provider value={{ data, loading, error, refresh }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
