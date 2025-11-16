import { useTheme } from '../contexts/ThemeContext'
import { useExport } from '../hooks/useExport'

function Header() {
  const { theme, toggleTheme } = useTheme()
  const { exportToCSV, exportToExcel, isExporting } = useExport()

  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Título */}
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
            Dashboard de Ocorrências
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Controle de Ponto
          </p>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-3">
          {/* Botão Export CSV */}
          <button
            onClick={exportToCSV}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exportando...' : 'Exportar CSV'}
          </button>

          {/* Botão Export Excel */}
          <button
            onClick={exportToExcel}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exportando...' : 'Exportar Excel'}
          </button>

          {/* Toggle Dark Mode */}
          <button
            onClick={toggleTheme}
            className="p-2 text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              // Ícone Sol (Light Mode)
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              // Ícone Lua (Dark Mode)
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
