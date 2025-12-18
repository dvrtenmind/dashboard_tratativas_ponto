import { useMemo } from 'react'
import { parseISO } from 'date-fns'
import { useData } from '../contexts/DataContext'
import { useFilters } from '../contexts/FilterContext'

export function useChartData() {
  const { data: ocorrencias } = useData()
  const { filters } = useFilters()

  // Aplica os filtros nos dados (mesma lógica do DataTable)
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

      // Filtro por matrícula(s)
      if (filters.matriculas && filters.matriculas.trim() !== '') {
        const matriculas = filters.matriculas
          .split(',')
          .map(m => m.trim())
          .filter(m => m !== '')

        if (matriculas.length > 0) {
          const itemMatricula = (item.id_colaborador || '').toString().toLowerCase()
          const hasMatch = matriculas.some(m =>
            itemMatricula.includes(m.toLowerCase())
          )
          if (!hasMatch) return false
        }
      }

      // Filtro por base
      if (filters.bases && filters.bases.length > 0) {
        if (!filters.bases.includes(item.base)) return false
      }

      return true
    })
  }, [ocorrencias, filters])

  // Agrupa dados por situação
  const dataGroupedBySituacao = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return []

    const grouped = {}

    filteredData.forEach(item => {
      const situacao = item.situacao || 'Sem Situação'

      if (!grouped[situacao]) {
        grouped[situacao] = {
          situacao,
          total_ocorrencias: 0,
          soma_horas: 0
        }
      }

      grouped[situacao].total_ocorrencias += 1

      // Converte total_horas_ocorrencia para horas decimais
      if (item.total_horas_ocorrencia) {
        const horasStr = item.total_horas_ocorrencia
        const [horas, minutos, segundos] = horasStr.split(':').map(Number)
        const horasDecimal = horas + (minutos / 60) + (segundos / 3600)
        grouped[situacao].soma_horas += horasDecimal
      }
    })

    // Converte objeto em array e ordena por total de ocorrências
    return Object.values(grouped).sort((a, b) => b.total_ocorrencias - a.total_ocorrencias)
  }, [filteredData])

  // Agrupa dados por data e situação (para gráfico de linhas)
  const dataGroupedByDateAndSituacao = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return []

    const grouped = {}

    filteredData.forEach(item => {
      const data = item.data
      const situacao = item.situacao || 'Sem Situação'
      const key = `${data}|${situacao}`

      if (!grouped[key]) {
        grouped[key] = {
          data,
          situacao,
          total_ocorrencias: 0,
          soma_horas: 0
        }
      }

      grouped[key].total_ocorrencias += 1

      // Converte total_horas_ocorrencia para horas decimais
      if (item.total_horas_ocorrencia) {
        const horasStr = item.total_horas_ocorrencia
        const [horas, minutos, segundos] = horasStr.split(':').map(Number)
        const horasDecimal = horas + (minutos / 60) + (segundos / 3600)
        grouped[key].soma_horas += horasDecimal
      }
    })

    // Converte objeto em array e ordena por data
    return Object.values(grouped).sort((a, b) => parseISO(a.data) - parseISO(b.data))
  }, [filteredData])

  return {
    dataGroupedBySituacao,
    dataGroupedByDateAndSituacao,
    filteredData
  }
}
