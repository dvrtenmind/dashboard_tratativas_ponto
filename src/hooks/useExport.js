import { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { useFilters } from '../contexts/FilterContext'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'

export function useExport() {
  const [isExporting, setIsExporting] = useState(false)
  const { data: ocorrencias } = useData()
  const { filters } = useFilters()

  // Função para filtrar os dados (mesma lógica do DataTable)
  const getFilteredData = () => {
    if (!ocorrencias) return []

    return ocorrencias.filter(item => {
      // Filtro por data
      if (filters.dateRange.start || filters.dateRange.end) {
        const itemDate = new Date(item.data)
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start)
          if (itemDate < startDate) return false
        }
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end)
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
  }

  const exportToCSV = () => {
    try {
      setIsExporting(true)
      const data = getFilteredData()

      if (data.length === 0) {
        alert('Não há dados para exportar')
        return
      }

      // Converte para CSV
      const headers = [
        'ID Registro',
        'ID Colaborador',
        'Nome',
        'Data',
        'Escala',
        'Código Horário',
        'Descrição Horário',
        'Início',
        'Término',
        'Total Horas',
        'Situação',
        'Total Horas Ocorrência'
      ]

      const rows = data.map(item => [
        item.id_registro,
        item.id_colaborador,
        item.nome,
        item.data,
        item.escala,
        item.codigo_horario,
        item.descricao_horario,
        item.inicio,
        item.termino,
        item.total_horas,
        item.situacao,
        item.total_horas_ocorrencia
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
      ].join('\n')

      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')

      link.setAttribute('href', url)
      link.setAttribute('download', `ocorrencias_ponto_${timestamp}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Erro ao exportar CSV:', error)
      alert('Erro ao exportar CSV')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = () => {
    try {
      setIsExporting(true)
      const data = getFilteredData()

      if (data.length === 0) {
        alert('Não há dados para exportar')
        return
      }

      // Prepara os dados para Excel
      const worksheetData = data.map(item => ({
        'ID Registro': item.id_registro,
        'ID Colaborador': item.id_colaborador,
        'Nome': item.nome,
        'Data': item.data,
        'Escala': item.escala,
        'Código Horário': item.codigo_horario,
        'Descrição Horário': item.descricao_horario,
        'Início': item.inicio,
        'Término': item.termino,
        'Total Horas': item.total_horas,
        'Situação': item.situacao,
        'Total Horas Ocorrência': item.total_horas_ocorrencia
      }))

      // Cria a planilha
      const worksheet = XLSX.utils.json_to_sheet(worksheetData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ocorrências')

      // Download do arquivo
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
      XLSX.writeFile(workbook, `ocorrencias_ponto_${timestamp}.xlsx`)
    } catch (error) {
      console.error('Erro ao exportar Excel:', error)
      alert('Erro ao exportar Excel')
    } finally {
      setIsExporting(false)
    }
  }

  return {
    exportToCSV,
    exportToExcel,
    isExporting
  }
}
