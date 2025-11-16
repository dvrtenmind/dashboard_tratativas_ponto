import BarChartBySituacao from './BarChartBySituacao'
import LineChartBySituacao from './LineChartBySituacao'
import PieChartOcorrenciasEspeciais from './PieChartOcorrenciasEspeciais'
import OccurrencesTable from './OccurrencesTable'

function ChartPlaceholders() {
  const ChartBox = ({ title, subtitle }) => (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <svg className="w-6 h-6 text-neutral-400 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-base font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          {title}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {subtitle}
        </p>
      </div>
    </div>
  )

  return (
    <div className="grid grid-rows-[340px_350px_400px] gap-3">
      {/* Linha superior - 2 gráficos */}
      <div className="grid grid-cols-2 gap-4">
        <BarChartBySituacao />
        <PieChartOcorrenciasEspeciais />
      </div>

      {/* Linha do meio - 1 gráfico largo */}
      <div className="grid grid-cols-1">
        <LineChartBySituacao />
      </div>

      {/* Linha inferior - Tabela de ocorrências */}
      <div className="grid grid-cols-1">
        <OccurrencesTable />
      </div>
    </div>
  )
}

export default ChartPlaceholders
