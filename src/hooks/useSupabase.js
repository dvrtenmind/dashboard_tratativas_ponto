import { useState, useEffect } from 'react'
import { supabase, TABLE_NAME } from '../utils/supabaseClient'

export function useSupabase() {
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

      const { data: ocorrencias, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('data', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setData(ocorrencias || [])
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

  return { data, loading, error, refresh }
}
