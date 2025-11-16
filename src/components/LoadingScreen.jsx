function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Spinner animado */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-neutral-200 dark:border-neutral-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-neutral-600 dark:border-t-neutral-400 rounded-full animate-spin"></div>
        </div>

        {/* Texto de loading */}
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
          Carregando dados...
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Buscando todas as ocorrências do banco de dados
        </p>
      </div>
    </div>
  )
}

export default LoadingScreen
