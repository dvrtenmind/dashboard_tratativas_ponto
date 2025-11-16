import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useChartData } from '../hooks/useChartData'
import { exportChartToCSV, exportChartToExcel } from '../utils/exportUtils'

function LineChartBySituacao() {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const { dataGroupedByDateAndSituacao } = useChartData()
  const [showExportMenu, setShowExportMenu] = useState(false)

  const handleExportCSV = () => {
    if (!dataGroupedByDateAndSituacao || dataGroupedByDateAndSituacao.length === 0) return
    const exportData = dataGroupedByDateAndSituacao.map(item => ({
      'Data': item.data,
      'Situação': item.situacao,
      'Total de Ocorrências': item.total_ocorrencias,
      'Total de Horas': item.soma_horas.toFixed(2)
    }))
    exportChartToCSV(exportData, 'ocorrencias_por_data_situacao')
    setShowExportMenu(false)
  }

  const handleExportExcel = () => {
    if (!dataGroupedByDateAndSituacao || dataGroupedByDateAndSituacao.length === 0) return
    const exportData = dataGroupedByDateAndSituacao.map(item => ({
      'Data': item.data,
      'Situação': item.situacao,
      'Total de Ocorrências': item.total_ocorrencias,
      'Total de Horas': item.soma_horas.toFixed(2)
    }))
    exportChartToExcel(exportData, 'ocorrencias_por_data_situacao', 'Ocorrências por Data e Situação')
    setShowExportMenu(false)
  }

  useEffect(() => {
    if (!dataGroupedByDateAndSituacao || dataGroupedByDateAndSituacao.length === 0 || !containerRef.current || !svgRef.current) return

    // Limpa o SVG anterior e tooltip
    d3.select(svgRef.current).selectAll('*').remove()
    d3.select(containerRef.current).selectAll('div').remove()

    // Dimensões
    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const margin = { top: 10, right: 120, bottom: 40, left: 50 }
    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom

    // Cria SVG
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Agrupa dados por situação para criar as linhas
    const situacoes = [...new Set(dataGroupedByDateAndSituacao.map(d => d.situacao))]
    const dataGroupedBySituacao = situacoes.map(situacao => ({
      situacao,
      values: dataGroupedByDateAndSituacao
        .filter(d => d.situacao === situacao)
        .map(d => ({ data: new Date(d.data), total_ocorrencias: d.total_ocorrencias }))
        .sort((a, b) => a.data - b.data)
    }))

    // Escalas de cores
    const colorScale = d3.scaleOrdinal()
      .domain(situacoes)
      .range(d3.schemeCategory10)

    // Escalas
    const allDates = dataGroupedByDateAndSituacao.map(d => new Date(d.data))
    const x = d3.scaleTime()
      .domain(d3.extent(allDates))
      .range([0, width])

    const maxOcorrencias = d3.max(dataGroupedByDateAndSituacao, d => d.total_ocorrencias)
    const y = d3.scaleLinear()
      .domain([0, maxOcorrencias])
      .nice()
      .range([height, 0])

    // Eixo X (datas)
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%d/%m')))
      .selectAll('text')
      .style('font-size', '11px')
      .attr('class', 'fill-neutral-700 dark:fill-neutral-300')

    // Eixo Y (ocorrências)
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('font-size', '11px')
      .attr('class', 'fill-neutral-700 dark:fill-neutral-300')

    // Label do eixo Y
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 10)
      .attr('x', -(height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '11px')
      .attr('class', 'fill-neutral-700 dark:fill-neutral-300')
      .text('Total de Ocorrências')

    // Gerador de linha
    const line = d3.line()
      .x(d => x(d.data))
      .y(d => y(d.total_ocorrencias))
      .curve(d3.curveMonotoneX)

    // Desenha as linhas
    dataGroupedBySituacao.forEach(({ situacao, values }) => {
      svg.append('path')
        .datum(values)
        .attr('fill', 'none')
        .attr('stroke', colorScale(situacao))
        .attr('stroke-width', 2)
        .attr('d', line)
        .attr('class', 'hover:stroke-width-3 transition-all')
    })

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

    // Adiciona pontos nas linhas com tooltip
    dataGroupedBySituacao.forEach(({ situacao, values }) => {
      // Busca os dados originais com horas para o tooltip
      const valuesWithHours = values.map(v => {
        const originalData = dataGroupedByDateAndSituacao.find(
          d => d.situacao === situacao && new Date(d.data).getTime() === v.data.getTime()
        )
        return {
          ...v,
          soma_horas: originalData?.soma_horas || 0
        }
      })

      svg.selectAll(`.dot-${situacao.replace(/[^a-zA-Z0-9]/g, '_')}`)
        .data(valuesWithHours)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.data))
        .attr('cy', d => y(d.total_ocorrencias))
        .attr('r', 3)
        .attr('fill', colorScale(situacao))
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 6)

          tooltip
            .style('visibility', 'visible')
            .html(`
              <div>
                <strong>${situacao}</strong><br/>
                Data: ${d.data.toLocaleDateString('pt-BR')}<br/>
                Ocorrências: ${d.total_ocorrencias}<br/>
                Horas: ${d.soma_horas.toFixed(2)}h
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
            .attr('r', 3)

          tooltip.style('visibility', 'hidden')
        })
    })

    // Legenda
    const legend = svg.append('g')
      .attr('transform', `translate(${width + 10}, 0)`)

    situacoes.forEach((situacao, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 18})`)

      legendRow.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', colorScale(situacao))

      legendRow.append('text')
        .attr('x', 18)
        .attr('y', 10)
        .style('font-size', '10px')
        .attr('class', 'fill-neutral-700 dark:fill-neutral-300')
        .text(situacao.length > 15 ? situacao.substring(0, 15) + '...' : situacao)
        .append('title')
        .text(situacao)
    })

  }, [dataGroupedByDateAndSituacao])

  if (!dataGroupedByDateAndSituacao || dataGroupedByDateAndSituacao.length === 0) {
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
          Evolução de Ocorrências por Situação
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

      <div ref={containerRef} className="flex-1 min-h-0">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
    </div>
  )
}

export default LineChartBySituacao
