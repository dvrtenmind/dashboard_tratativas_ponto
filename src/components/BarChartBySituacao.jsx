import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useChartData } from '../hooks/useChartData'
import { exportChartToCSV, exportChartToExcel } from '../utils/exportUtils'

function BarChartBySituacao() {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const { dataGroupedBySituacao } = useChartData()
  const [showExportMenu, setShowExportMenu] = useState(false)

  const handleExportCSV = () => {
    const exportData = dataGroupedBySituacao.map(item => ({
      'Situação': item.situacao,
      'Total de Ocorrências': item.total_ocorrencias,
      'Total de Horas': item.soma_horas.toFixed(2)
    }))
    exportChartToCSV(exportData, 'ocorrencias_por_situacao')
    setShowExportMenu(false)
  }

  const handleExportExcel = () => {
    const exportData = dataGroupedBySituacao.map(item => ({
      'Situação': item.situacao,
      'Total de Ocorrências': item.total_ocorrencias,
      'Total de Horas': item.soma_horas.toFixed(2)
    }))
    exportChartToExcel(exportData, 'ocorrencias_por_situacao', 'Ocorrências por Situação')
    setShowExportMenu(false)
  }

  useEffect(() => {
    if (!dataGroupedBySituacao || dataGroupedBySituacao.length === 0 || !containerRef.current) return

    // Limpa o SVG anterior
    d3.select(svgRef.current).selectAll('*').remove()

    // Dimensões
    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const margin = { top: 5, right: 60, bottom: 30, left: 150 }
    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom

    // Cria SVG
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Escalas (invertidas para horizontal)
    const y = d3.scaleBand()
      .domain(dataGroupedBySituacao.map(d => d.situacao))
      .range([0, height])
      .padding(0.2)

    const x = d3.scaleLinear()
      .domain([0, d3.max(dataGroupedBySituacao, d => d.total_ocorrencias)])
      .nice()
      .range([0, width])

    // Eixo Y (situações)
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '12px')
      .attr('class', 'fill-neutral-700 dark:fill-neutral-300')

    // Eixo X (total de ocorrências)
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .attr('class', 'text-neutral-700 dark:text-neutral-300')
      .selectAll('text')
      .style('font-size', '11px')

    // Label do eixo X
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 3)
      .style('text-anchor', 'middle')
      .style('font-size', '11px')
      .attr('class', 'fill-neutral-700 dark:fill-neutral-300')
      .text('Total de Ocorrências')

    // Barras horizontais
    svg.selectAll('.bar')
      .data(dataGroupedBySituacao)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.situacao))
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('width', d => x(d.total_ocorrencias))
      .attr('fill', '#737373')
      .attr('class', 'fill-neutral-500 dark:fill-neutral-400 hover:fill-neutral-600 dark:hover:fill-neutral-300 transition-colors')

    // Labels com ocorrências e horas
    svg.selectAll('.label')
      .data(dataGroupedBySituacao)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.total_ocorrencias) + 5)
      .attr('y', d => y(d.situacao) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .attr('class', 'fill-neutral-700 dark:fill-neutral-200')
      .text(d => `${d.total_ocorrencias} (${d.soma_horas.toFixed(1)}h)`)

  }, [dataGroupedBySituacao])

  if (!dataGroupedBySituacao || dataGroupedBySituacao.length === 0) {
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
          Ocorrências por Situação
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

export default BarChartBySituacao
