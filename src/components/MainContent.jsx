import ChartPlaceholders from './ChartPlaceholders'

function MainContent() {
  return (
    <main className="flex-1 overflow-hidden p-4 bg-neutral-50 dark:bg-neutral-950 h-full">
      <div className="h-full max-w-[1800px] mx-auto">
        {/* Área para gráficos futuros */}
        <ChartPlaceholders />
      </div>
    </main>
  )
}

export default MainContent
