import * as XLSX from 'xlsx'
import { format } from 'date-fns'

export const exportTableToExcel = (allData) => {
  if (!allData || allData.length === 0) {
    alert('Não há dados para exportar')
    return
  }

  const workbook = XLSX.utils.book_new()

  // Função para calcular totais
  const calcularTotais = (data) => {
    let total_ocorrencias = data.length
    let soma_horas = 0

    data.forEach(item => {
      if (item.total_horas_ocorrencia) {
        const [horas, minutos, segundos] = item.total_horas_ocorrencia.split(':').map(Number)
        soma_horas += horas + (minutos / 60) + (segundos / 3600)
      }
    })

    return { total_ocorrencias, soma_horas }
  }

  const resumoData = []

  // 1. Aba "Dados" - Todos os registros filtrados
  const dadosWorksheet = XLSX.utils.json_to_sheet(allData)
  XLSX.utils.book_append_sheet(workbook, dadosWorksheet, 'Dados')

  const totaisDados = calcularTotais(allData)
  resumoData.push({
    'Aba': 'Dados',
    'Total de Ocorrências': totaisDados.total_ocorrencias,
    'Total de Horas': totaisDados.soma_horas.toFixed(2)
  })

  // 2. Categorizar dados automaticamente

  // 2.1. Marcações Inválidas
  const marcacoesInvalidas = allData.filter(item => {
    const situacao = (item.situacao || '').toLowerCase()
    return situacao.includes('marcações inválidas') || situacao.includes('marcação inválida')
  })

  if (marcacoesInvalidas.length > 0) {
    const worksheet = XLSX.utils.json_to_sheet(marcacoesInvalidas)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Marcações Inválidas')

    const totais = calcularTotais(marcacoesInvalidas)
    resumoData.push({
      'Aba': 'Marcações Inválidas',
      'Total de Ocorrências': totais.total_ocorrencias,
      'Total de Horas': totais.soma_horas.toFixed(2)
    })
  }

  // 2.2. Débito e Crédito no Mesmo Dia
  const ocorrenciasPorDiaColaborador = {}

  allData.forEach(item => {
    const key = `${item.id_colaborador}|${item.data}`
    if (!ocorrenciasPorDiaColaborador[key]) {
      ocorrenciasPorDiaColaborador[key] = {
        temCredito: false,
        temDebito: false,
        items: []
      }
    }

    const situacao = (item.situacao || '').toLowerCase()
    if (situacao.includes('crédito')) {
      ocorrenciasPorDiaColaborador[key].temCredito = true
    }
    if (situacao.includes('débito')) {
      ocorrenciasPorDiaColaborador[key].temDebito = true
    }

    ocorrenciasPorDiaColaborador[key].items.push(item)
  })

  const debitoCreditoMesmoDia = []
  Object.values(ocorrenciasPorDiaColaborador).forEach(grupo => {
    if (grupo.temCredito && grupo.temDebito) {
      debitoCreditoMesmoDia.push(...grupo.items)
    }
  })

  if (debitoCreditoMesmoDia.length > 0) {
    const worksheet = XLSX.utils.json_to_sheet(debitoCreditoMesmoDia)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Débito e Crédito')

    const totais = calcularTotais(debitoCreditoMesmoDia)
    resumoData.push({
      'Aba': 'Débito e Crédito',
      'Total de Ocorrências': totais.total_ocorrencias,
      'Total de Horas': totais.soma_horas.toFixed(2)
    })
  }

  // 2.3. Horas Extras > 6h
  const horasExtras6h = allData.filter(item => {
    const situacao = (item.situacao || '').toLowerCase()
    const isCredito = situacao.includes('crédito')

    if (isCredito && item.total_horas_ocorrencia) {
      const [horas, minutos, segundos] = item.total_horas_ocorrencia.split(':').map(Number)
      const totalHoras = horas + (minutos / 60) + (segundos / 3600)
      return totalHoras > 6
    }

    return false
  })

  if (horasExtras6h.length > 0) {
    const worksheet = XLSX.utils.json_to_sheet(horasExtras6h)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Horas Extras +6h')

    const totais = calcularTotais(horasExtras6h)
    resumoData.push({
      'Aba': 'Horas Extras +6h',
      'Total de Ocorrências': totais.total_ocorrencias,
      'Total de Horas': totais.soma_horas.toFixed(2)
    })
  }

  // 2.4. Folgas Trabalhadas
  const folgasTrabalhadas = allData.filter(item => {
    const descricao = (item.descricao_horario || '').toLowerCase()
    return descricao.includes('dsr') || descricao.includes('folga')
  })

  if (folgasTrabalhadas.length > 0) {
    const worksheet = XLSX.utils.json_to_sheet(folgasTrabalhadas)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Folgas Trabalhadas')

    const totais = calcularTotais(folgasTrabalhadas)
    resumoData.push({
      'Aba': 'Folgas Trabalhadas',
      'Total de Ocorrências': totais.total_ocorrencias,
      'Total de Horas': totais.soma_horas.toFixed(2)
    })
  }

  // 3. Aba "Resumo" - Totais de cada aba
  const resumoWorksheet = XLSX.utils.json_to_sheet(resumoData)
  XLSX.utils.book_append_sheet(workbook, resumoWorksheet, 'Resumo')

  // Download do arquivo
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
  XLSX.writeFile(workbook, `tabela_ocorrencias_${timestamp}.xlsx`)
}
