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

  // Utility functions for workday compatibility checking
  const parseTimeToMinutes = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return null

    try {
      const parts = timeString.trim().split(':')
      if (parts.length < 2) return null

      const hours = parseInt(parts[0], 10)
      const minutes = parseInt(parts[1], 10)

      if (isNaN(hours) || isNaN(minutes)) return null

      return hours * 60 + minutes
    } catch (e) {
      return null
    }
  }

  const calculateTimeDifference = (startTime, endTime) => {
    const startMinutes = parseTimeToMinutes(startTime)
    const endMinutes = parseTimeToMinutes(endTime)

    if (startMinutes === null || endMinutes === null) return null

    let diff = endMinutes - startMinutes

    // Handle overnight shifts (crossing midnight)
    if (diff < 0) {
      diff += 24 * 60  // Add 24 hours
    }

    return diff
  }

  const parseEscalaHours = (escala) => {
    if (!escala || typeof escala !== 'string') return null

    try {
      // Extract time component: "22:00/04:00-6X1-OP-180" -> "22:00/04:00"
      const timePart = escala.split('-')[0].trim()

      // Split by "/" to get [startTime, endTime]
      const times = timePart.split('/')

      if (times.length !== 2) return null

      return calculateTimeDifference(times[0].trim(), times[1].trim())
    } catch (e) {
      return null
    }
  }

  const parseDescricaoHorarioHours = (descricaoHorario) => {
    if (!descricaoHorario || typeof descricaoHorario !== 'string') return null

    try {
      const normalized = descricaoHorario.toLowerCase().trim()

      // Exclude Folga and DSR records
      if (normalized.includes('folga') || normalized.includes('dsr')) {
        return null
      }

      // Remove "AS" separator (case-insensitive)
      const cleaned = descricaoHorario.replace(/\s+as\s+/gi, ' ')

      // Extract all time components (HH:MM format)
      const timeRegex = /\d{1,2}:\d{2}/g
      const times = cleaned.match(timeRegex)

      if (!times) return null

      if (times.length === 2) {
        // Format: "05:00 11:00" (start, end)
        return calculateTimeDifference(times[0], times[1])
      } else if (times.length === 4) {
        // Format: "05:00 11:00 12:00 18:00" (morning + afternoon)
        const morningMinutes = calculateTimeDifference(times[0], times[1])
        const afternoonMinutes = calculateTimeDifference(times[2], times[3])

        if (morningMinutes === null || afternoonMinutes === null) return null

        return morningMinutes + afternoonMinutes
      } else {
        return null  // Invalid format
      }
    } catch (e) {
      return null
    }
  }

  const isIncompatibleWorkday = (record) => {
    const escalaMinutes = parseEscalaHours(record.escala)
    const descricaoMinutes = parseDescricaoHorarioHours(record.descricao_horario)

    // If either cannot be parsed, cannot determine incompatibility
    if (escalaMinutes === null || descricaoMinutes === null) {
      return false
    }

    // Calculate the difference
    const diffMinutes = Math.abs(escalaMinutes - descricaoMinutes)

    // Check if difference matches lunch break rules
    // For 6-hour shifts: 15 minutes lunch
    // For 8+ hour shifts: 60 minutes lunch

    // If exactly equal, it's compatible
    if (diffMinutes === 0) {
      return false
    }

    // For 6-hour shifts (360 minutes), 15-minute lunch is acceptable
    if (escalaMinutes === 360 && diffMinutes === 15) {
      return false  // Compatible - valid lunch break
    }

    // For 8+ hour shifts (480+ minutes), 60-minute lunch is acceptable
    if (escalaMinutes >= 480 && diffMinutes === 60) {
      return false  // Compatible - valid lunch break
    }

    // Any other difference is incompatible
    return true
  }

  // Função para reordenar colunas (base sempre na 4ª posição)
  const reorderColumns = (data) => {
    const columnOrder = ['data', 'id_colaborador', 'nome', 'base', 'situacao', 'descricao_horario', 'total_horas_ocorrencia', 'justificativa']

    return data.map(item => {
      const ordered = {}
      // Primeiro adiciona as colunas na ordem definida
      columnOrder.forEach(col => {
        if (item.hasOwnProperty(col)) {
          ordered[col] = item[col]
        }
      })
      // Depois adiciona as demais colunas que não estão na lista
      Object.keys(item).forEach(key => {
        if (!columnOrder.includes(key)) {
          ordered[key] = item[key]
        }
      })
      return ordered
    })
  }

  const resumoData = []

  // 1. Aba "Dados" - Todos os registros filtrados
  const dadosWorksheet = XLSX.utils.json_to_sheet(reorderColumns(allData))
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
    const worksheet = XLSX.utils.json_to_sheet(reorderColumns(marcacoesInvalidas))
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
    const worksheet = XLSX.utils.json_to_sheet(reorderColumns(debitoCreditoMesmoDia))
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
    const worksheet = XLSX.utils.json_to_sheet(reorderColumns(horasExtras6h))
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
    const worksheet = XLSX.utils.json_to_sheet(reorderColumns(folgasTrabalhadas))
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Folgas Trabalhadas')

    const totais = calcularTotais(folgasTrabalhadas)
    resumoData.push({
      'Aba': 'Folgas Trabalhadas',
      'Total de Ocorrências': totais.total_ocorrencias,
      'Total de Horas': totais.soma_horas.toFixed(2)
    })
  }

  // 2.5. Débito BH (sem marcação de entrada e saída)
  const debitosBH = allData.filter(item => {
    const situacao = (item.situacao || '').toLowerCase()
    const isDebitoBH = situacao.includes('débito') && situacao.includes('bh')
    const semMarcacao = !item.inicio && !item.termino
    return isDebitoBH && semMarcacao
  })

  if (debitosBH.length > 0) {
    const worksheet = XLSX.utils.json_to_sheet(reorderColumns(debitosBH))
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Débito BH')

    const totais = calcularTotais(debitosBH)
    resumoData.push({
      'Aba': 'Débito BH',
      'Total de Ocorrências': totais.total_ocorrencias,
      'Total de Horas': totais.soma_horas.toFixed(2)
    })
  }

  // 2.6. Incompatibilidade de Jornada
  const incompatibilidades = allData.filter(item => isIncompatibleWorkday(item))

  if (incompatibilidades.length > 0) {
    // Remove duplicados baseado em id_colaborador + data
    // Mantém apenas o primeiro registro de cada combinação
    const seen = new Set()
    const incompatibilidadesUnicas = incompatibilidades.filter(item => {
      const key = `${item.id_colaborador}|${item.data}`
      if (seen.has(key)) {
        return false  // Duplicado, remover
      }
      seen.add(key)
      return true  // Primeiro registro desta chave, manter
    })

    // Enrich data with calculated values for transparency
    const enrichedData = incompatibilidadesUnicas.map(item => {
      const escalaMinutes = parseEscalaHours(item.escala)
      const descricaoMinutes = parseDescricaoHorarioHours(item.descricao_horario)

      return {
        ...item,
        horas_calculadas_escala: escalaMinutes !== null ? (escalaMinutes / 60).toFixed(2) : 'N/A',
        horas_calculadas_descricao: descricaoMinutes !== null ? (descricaoMinutes / 60).toFixed(2) : 'N/A'
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(reorderColumns(enrichedData))
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Incompatibilidade Jornada')

    const totais = calcularTotais(incompatibilidadesUnicas)
    resumoData.push({
      'Aba': 'Incompatibilidade Jornada',
      'Total de Ocorrências': totais.total_ocorrencias,
      'Total de Horas': totais.soma_horas.toFixed(2)
    })
  }

  // 3. Aba "Ocorrências por Colaborador" - Resumo por colaborador
  const colaboradoresMap = new Map()

  allData.forEach(item => {
    if (!colaboradoresMap.has(item.id_colaborador)) {
      colaboradoresMap.set(item.id_colaborador, {
        id_colaborador: item.id_colaborador,
        nome: item.nome,
        base: item.base || 'Sem Base'
      })
    }
  })

  const contarPorColaborador = (data) => {
    const contagem = {}
    data.forEach(item => {
      contagem[item.id_colaborador] = (contagem[item.id_colaborador] || 0) + 1
    })
    return contagem
  }

  const contagemMarcacoes = contarPorColaborador(marcacoesInvalidas)
  const contagemDebitoCredito = contarPorColaborador(debitoCreditoMesmoDia)
  const contagemHorasExtras = contarPorColaborador(horasExtras6h)
  const contagemFolgas = contarPorColaborador(folgasTrabalhadas)
  const contagemDebitoBH = contarPorColaborador(debitosBH)
  const contagemIncompatibilidade = contarPorColaborador(incompatibilidades)

  const ocorrenciasPorColaborador = Array.from(colaboradoresMap.values()).map(colab => {
    const marcacoes = contagemMarcacoes[colab.id_colaborador] || 0
    const debitoCredito = contagemDebitoCredito[colab.id_colaborador] || 0
    const horasExtras = contagemHorasExtras[colab.id_colaborador] || 0
    const folgas = contagemFolgas[colab.id_colaborador] || 0
    const debitoBH = contagemDebitoBH[colab.id_colaborador] || 0
    const incompatibilidade = contagemIncompatibilidade[colab.id_colaborador] || 0

    const total = marcacoes + debitoCredito + horasExtras + folgas + debitoBH + incompatibilidade

    return {
      'id_colaborador': colab.id_colaborador,
      'nome': colab.nome,
      'base': colab.base,
      'Marcações Inválidas': marcacoes,
      'Débito e Crédito': debitoCredito,
      'Horas Extras +6h': horasExtras,
      'Folgas Trabalhadas': folgas,
      'Débito BH': debitoBH,
      'Incompatibilidade Jornada': incompatibilidade,
      'Total': total
    }
  })

  ocorrenciasPorColaborador.sort((a, b) => b.Total - a.Total)

  if (ocorrenciasPorColaborador.length > 0) {
    const ocorrenciasWorksheet = XLSX.utils.json_to_sheet(ocorrenciasPorColaborador)
    XLSX.utils.book_append_sheet(workbook, ocorrenciasWorksheet, 'Ocorrências por Colaborador')
  }

  // 4. Aba "Ocorrências por Base" - Resumo por base
  const basesSet = new Set()
  allData.forEach(item => {
    basesSet.add(item.base || 'Sem Base')
  })

  const contarPorBase = (data) => {
    const contagem = {}
    data.forEach(item => {
      const base = item.base || 'Sem Base'
      contagem[base] = (contagem[base] || 0) + 1
    })
    return contagem
  }

  const contagemMarcacoesBase = contarPorBase(marcacoesInvalidas)
  const contagemDebitoCreditoBase = contarPorBase(debitoCreditoMesmoDia)
  const contagemHorasExtrasBase = contarPorBase(horasExtras6h)
  const contagemFolgasBase = contarPorBase(folgasTrabalhadas)
  const contagemDebitoBHBase = contarPorBase(debitosBH)
  const contagemIncompatibilidadeBase = contarPorBase(incompatibilidades)

  const ocorrenciasPorBase = Array.from(basesSet).map(base => {
    const marcacoes = contagemMarcacoesBase[base] || 0
    const debitoCredito = contagemDebitoCreditoBase[base] || 0
    const horasExtras = contagemHorasExtrasBase[base] || 0
    const folgas = contagemFolgasBase[base] || 0
    const debitoBH = contagemDebitoBHBase[base] || 0
    const incompatibilidade = contagemIncompatibilidadeBase[base] || 0

    const total = marcacoes + debitoCredito + horasExtras + folgas + debitoBH + incompatibilidade

    return {
      'base': base,
      'Marcações Inválidas': marcacoes,
      'Débito e Crédito': debitoCredito,
      'Horas Extras +6h': horasExtras,
      'Folgas Trabalhadas': folgas,
      'Débito BH': debitoBH,
      'Incompatibilidade Jornada': incompatibilidade,
      'Total': total
    }
  })

  ocorrenciasPorBase.sort((a, b) => b.Total - a.Total)

  if (ocorrenciasPorBase.length > 0) {
    const ocorrenciasBaseWorksheet = XLSX.utils.json_to_sheet(ocorrenciasPorBase)
    XLSX.utils.book_append_sheet(workbook, ocorrenciasBaseWorksheet, 'Ocorrências por Base')
  }

  // 5. Aba "Resumo" - Totais de cada aba
  const resumoWorksheet = XLSX.utils.json_to_sheet(resumoData)
  XLSX.utils.book_append_sheet(workbook, resumoWorksheet, 'Resumo')

  // Download do arquivo
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
  XLSX.writeFile(workbook, `tabela_ocorrencias_${timestamp}.xlsx`)
}
