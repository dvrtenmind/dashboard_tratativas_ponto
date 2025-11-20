import ChartPlaceholders from './ChartPlaceholders'

function MainContent() {
  return (
    <main className="flex-1 overflow-y-auto p-3 bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-[2000px] mx-auto">
        {/* Área para gráficos futuros */}
        <ChartPlaceholders />
      </div>
    </main>
  )
}

export default MainContent
