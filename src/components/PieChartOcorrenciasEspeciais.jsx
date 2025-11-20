import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useChartData } from '../hooks/useChartData'
import { exportChartToCSV, exportChartToExcel } from '../utils/exportUtils'

function PieChartOcorrenciasEspeciais() {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const { filteredData } = useChartData()
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Processa os dados para as categorias especiais
  const processedData = (() => {
    if (!filteredData || filteredData.length === 0) return []

    // 1. Folgas trabalhadas
    const folgasTrabalhadas = filteredData.filter(item => {
      const descricao = (item.descricao_horario || '').toLowerCase()
      return descricao.includes('dsr') || descricao.includes('folga')
    })

    // 2. Horas extras acima de 6 horas
    const horasExtras = filteredData.filter(item => {
      const situacao = (item.situacao || '').toLowerCase()
      const isCredito = situacao.includes('crédito')

      if (!isCredito || !item.total_horas_ocorrencia) return false

      const [horas, minutos, segundos] = item.total_horas_ocorrencia.split(':').map(Number)
      const totalHoras = horas + (minutos / 60) + (segundos / 3600)

      return totalHoras > 6
    })

    // 3. Débito e crédito no mesmo dia
    const ocorrenciasPorDiaColaborador = {}

    filteredData.forEach(item => {
      const key = `${item.id_colaborador}|${item.data}`
      if (!ocorrenciasPorDiaColaborador[key]) {
        ocorrenciasPorDiaColaborador[key] = {
          colaborador: item.id_colaborador,
          data: item.data,
          temCredito: false,
          temDebito: false,
          ocorrencias: []
        }
      }

      const situacao = (item.situacao || '').toLowerCase()
      if (situacao.includes('crédito')) {
        ocorrenciasPorDiaColaborador[key].temCredito = true
      }
      if (situacao.includes('débito')) {
        ocorrenciasPorDiaColaborador[key].temDebito = true
      }

      ocorrenciasPorDiaColaborador[key].ocorrencias.push(item)
    })

    const debitoECreditoMesmoDia = []
    Object.values(ocorrenciasPorDiaColaborador).forEach(grupo => {
      if (grupo.temCredito && grupo.temDebito) {
        debitoECreditoMesmoDia.push(...grupo.ocorrencias)
      }
    })

    // Calcula totais para cada categoria
    const calcularTotais = (items) => {
      let total_ocorrencias = items.length
      let soma_horas = 0

      items.forEach(item => {
        if (item.total_horas_ocorrencia) {
          const [horas, minutos, segundos] = item.total_horas_ocorrencia.split(':').map(Number)
          soma_horas += horas + (minutos / 60) + (segundos / 3600)
        }
      })

      return { total_ocorrencias, soma_horas }
    }

    const result = [
      {
        categoria: 'Folgas Trabalhadas',
        ...calcularTotais(folgasTrabalhadas),
        color: '#3b82f6' // blue-500
      },
      {
        categoria: 'Horas Extras > 6h',
        ...calcularTotais(horasExtras),
        color: '#f59e0b' // amber-500
      },
      {
        categoria: 'Débito e Crédito Mesmo Dia',
        ...calcularTotais(debitoECreditoMesmoDia),
        color: '#ef4444' // red-500
      }
    ].filter(item => item.total_ocorrencias > 0) // Remove categorias sem dados

    return result
  })()

  const handleExportCSV = () => {
    if (!processedData || processedData.length === 0) return
    const exportData = processedData.map(item => ({
      'Categoria': item.categoria,
      'Total de Ocorrências': item.total_ocorrencias,
      'Total de Horas': item.soma_horas.toFixed(2)
    }))
    exportChartToCSV(exportData, 'ocorrencias_especiais')
    setShowExportMenu(false)
  }

  const handleExportExcel = () => {
    if (!processedData || processedData.length === 0) return
    const exportData = processedData.map(item => ({
      'Categoria': item.categoria,
      'Total de Ocorrências': item.total_ocorrencias,
      'Total de Horas': item.soma_horas.toFixed(2)
    }))
    exportChartToExcel(exportData, 'ocorrencias_especiais', 'Ocorrências Especiais')
    setShowExportMenu(false)
  }

  useEffect(() => {
    if (!processedData || processedData.length === 0 || !containerRef.current || !svgRef.current) return

    // Limpa o SVG anterior e tooltip
    d3.select(svgRef.current).selectAll('*').remove()
    d3.select(containerRef.current).selectAll('div').remove()

    // Dimensões
    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const margin = { top: 20, right: 120, bottom: 20, left: 20 }
    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom
    const radius = Math.min(width, height) / 2.5

    // Cria SVG
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${(containerWidth - margin.right) / 2 + margin.left},${containerHeight / 2})`)

    // Cria tooltip
    const tooltip = d3.select(containerRef.current)
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.2)')

    // Gerador de arcos
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius - 10)

    const arcHover = d3.arc()
      .innerRadius(0)
      .outerRadius(radius)

    // Gerador de pizza
    const pie = d3.pie()
      .value(d => d.total_ocorrencias)
      .sort(null)

    // Desenha as fatias
    const arcs = svg.selectAll('.arc')
      .data(pie(processedData))
      .enter()
      .append('g')
      .attr('class', 'arc')

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover)

        tooltip
          .style('visibility', 'visible')
          .html(`
            <div>
              <strong>${d.data.categoria}</strong><br/>
              Ocorrências: ${d.data.total_ocorrencias}<br/>
              Horas: ${d.data.soma_horas.toFixed(2)}h<br/>
              Percentual: ${((d.data.total_ocorrencias / d3.sum(processedData, d => d.total_ocorrencias)) * 100).toFixed(1)}%
            </div>
          `)
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc)

        tooltip.style('visibility', 'hidden')
      })

    // Adiciona labels com percentuais
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .attr('class', 'fill-white')
      .text(d => {
        const percent = ((d.data.total_ocorrencias / d3.sum(processedData, d => d.total_ocorrencias)) * 100).toFixed(1)
        return percent > 5 ? `${percent}%` : '' // Só mostra se maior que 5%
      })

    // Legenda à direita (centralizada verticalmente)
    const legendHeight = processedData.length * 60
    const legend = svg.append('g')
      .attr('transform', `translate(${radius + 30}, ${-legendHeight / 2})`)

    processedData.forEach((item, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 60})`)

      legendRow.append('rect')
        .attr('width', 14)
        .attr('height', 14)
        .attr('fill', item.color)
        .attr('rx', 2)

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 10)
        .style('font-size', '11px')
        .style('font-weight', '600')
        .attr('class', 'fill-neutral-900 dark:fill-neutral-50')
        .text(item.categoria)

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 26)
        .style('font-size', '10px')
        .attr('class', 'fill-neutral-600 dark:fill-neutral-400')
        .text(`${item.total_ocorrencias} ocorrências`)

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 40)
        .style('font-size', '10px')
        .attr('class', 'fill-neutral-600 dark:fill-neutral-400')
        .text(`${item.soma_horas.toFixed(1)}h`)
    })

  }, [processedData])

  if (!processedData || processedData.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Sem dados disponíveis
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-2 h-full flex flex-col">
      {/* Header com título e botão de export */}
      <div className="flex items-center justify-between mb-1 px-1">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          Ocorrências Especiais
        </h3>

        {/* Botão de export com dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
            title="Exportar dados do gráfico"
          >
            <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          {/* Menu dropdown */}
          {showExportMenu && (
            <>
              {/* Overlay para fechar o menu ao clicar fora */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowExportMenu(false)}
              ></div>

              {/* Menu */}
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-20">
                <button
                  onClick={handleExportCSV}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-t-lg transition-colors"
                >
                  Exportar CSV
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-b-lg transition-colors"
                >
                  Exportar Excel
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0 relative">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
    </div>
  )
}

export default PieChartOcorrenciasEspeciais
