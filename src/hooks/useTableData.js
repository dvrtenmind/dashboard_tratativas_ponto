import { useMemo, useState, useEffect } from 'react'
import { useChartData } from './useChartData'
import { useData } from '../contexts/DataContext'
import { useFilters } from '../contexts/FilterContext'

export function useTableData() {
  const { filteredData } = useChartData()
  const { data: allOcorrencias } = useData()
  const { filters } = useFilters()

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(25)

  // Reseta a página quando os filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Identifica ocorrências especiais em TODOS os dados
  const categorizarEspeciais = useMemo(() => {
    if (!allOcorrencias || allOcorrencias.length === 0) return new Map()

    const map = new Map()

    // 1. Folgas trabalhadas
    allOcorrencias.forEach(item => {
      const descricao = (item.descricao_horario || '').toLowerCase()
      if (descricao.includes('dsr') || descricao.includes('folga')) {
        const key = `${item.id}` // Usar ID único do registro
        if (!map.has(key)) map.set(key, [])
        map.get(key).push('folgas_trabalhadas')
      }
    })

    // 2. Horas extras acima de 6 horas
    allOcorrencias.forEach(item => {
      const situacao = (item.situacao || '').toLowerCase()
      const isCredito = situacao.includes('crédito')

      if (isCredito && item.total_horas_ocorrencia) {
        const [horas, minutos, segundos] = item.total_horas_ocorrencia.split(':').map(Number)
        const totalHoras = horas + (minutos / 60) + (segundos / 3600)

        if (totalHoras > 6) {
          const key = `${item.id}`
          if (!map.has(key)) map.set(key, [])
          map.get(key).push('horas_extras_6h')
        }
      }
    })

    // 3. Débito e crédito no mesmo dia
    const ocorrenciasPorDiaColaborador = {}

    allOcorrencias.forEach(item => {
      const key = `${item.id_colaborador}|${item.data}`
      if (!ocorrenciasPorDiaColaborador[key]) {
        ocorrenciasPorDiaColaborador[key] = {
          temCredito: false,
          temDebito: false,
          ids: []
        }
      }

      const situacao = (item.situacao || '').toLowerCase()
      if (situacao.includes('crédito')) {
        ocorrenciasPorDiaColaborador[key].temCredito = true
      }
      if (situacao.includes('débito')) {
        ocorrenciasPorDiaColaborador[key].temDebito = true
      }

      ocorrenciasPorDiaColaborador[key].ids.push(item.id)
    })

    Object.values(ocorrenciasPorDiaColaborador).forEach(grupo => {
      if (grupo.temCredito && grupo.temDebito) {
        grupo.ids.forEach(id => {
          const key = `${id}`
          if (!map.has(key)) map.set(key, [])
          map.get(key).push('debito_credito_mesmo_dia')
        })
      }
    })

    return map
  }, [allOcorrencias])

  // Usa os dados filtrados
  const tableData = useMemo(() => {
    return filteredData || []
  }, [filteredData])

  // Paginação
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return tableData.slice(startIndex, endIndex)
  }, [tableData, currentPage, pageSize])

  const totalPages = Math.ceil(tableData.length / pageSize)

  // Separar dados por categoria especial (para exportação)
  const dataByCategory = useMemo(() => {
    const categories = {
      folgas_trabalhadas: [],
      horas_extras_6h: [],
      debito_credito_mesmo_dia: []
    }

    tableData.forEach(item => {
      const categorias = categorizarEspeciais.get(`${item.id}`) || []

      if (categorias.includes('folgas_trabalhadas')) {
        categories.folgas_trabalhadas.push(item)
      }
      if (categorias.includes('horas_extras_6h')) {
        categories.horas_extras_6h.push(item)
      }
      if (categorias.includes('debito_credito_mesmo_dia')) {
        categories.debito_credito_mesmo_dia.push(item)
      }
    })

    return categories
  }, [tableData, categorizarEspeciais])

  return {
    tableData,
    paginatedData,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    totalRecords: tableData.length,
    dataByCategory
  }
}
