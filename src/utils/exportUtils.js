import * as XLSX from 'xlsx'
import { format } from 'date-fns'

export const exportChartToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar')
    return
  }

  // Converte para CSV
  const headers = Object.keys(data[0])
  const rows = data.map(item =>
    headers.map(header => `"${item[header] || ''}"`).join(',')
  )

  const csvContent = [
    headers.join(','),
    ...rows
  ].join('\n')

  // Download do arquivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${timestamp}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportChartToExcel = (data, filename, sheetName = 'Dados') => {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar')
    return
  }

  // Cria a planilha
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Download do arquivo
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
  XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`)
}
