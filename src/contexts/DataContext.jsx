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

      // Busca TODOS os ativos com paginação (Supabase limita a 1000 por query)
      let allAtivos = []
      let ativosFrom = 0
      let ativosHasMore = true

      while (ativosHasMore) {
        const { data: ativosBatch, error: ativosError } = await supabase
          .from('ativos')
          .select('id, base')
          .range(ativosFrom, ativosFrom + batchSize - 1)

        if (ativosError) {
          console.warn('Erro ao buscar ativos:', ativosError)
          break
        }

        if (ativosBatch && ativosBatch.length > 0) {
          allAtivos = [...allAtivos, ...ativosBatch]
          ativosFrom += batchSize
          ativosHasMore = ativosBatch.length === batchSize
        } else {
          ativosHasMore = false
        }
      }

      // Cria mapa de lookup id -> base (convertendo para string para garantir correspondência)
      const ativosMap = new Map()
      allAtivos.forEach(a => ativosMap.set(String(a.id), a.base))

      // Enriquece os dados com o campo base
      const enrichedData = allData.map(item => ({
        ...item,
        base: ativosMap.get(String(item.id_colaborador)) || 'Sem Base'
      }))

      setData(enrichedData)
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
