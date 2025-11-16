# Dashboard de Ocorrências de Ponto

Dashboard moderno e minimalista para visualização e análise de ocorrências de ponto, desenvolvido com React + Vite + TailwindCSS.

## Funcionalidades Implementadas

### ✅ Características Principais

- **Design Minimalista**: Interface clean com paleta de cores neutras
- **Dark/Light Mode**: Alternância entre tema claro e escuro com persistência
- **Filtros Multi-Seleção**:
  - Filtro por período (data inicial e final)
  - Filtro por situação/ocorrência
  - Filtro por colaborador (com busca)
- **Menu Lateral Fixo**: Sidebar sempre visível com todos os filtros
- **Exportação de Dados**:
  - Export para CSV
  - Export para Excel
  - Exporta dados completos ou filtrados
- **Conexão Supabase**: Integração com banco de dados PostgreSQL
- **Placeholders para Gráficos**: Áreas demarcadas para futuros gráficos (3 + 1 + 3)

## Estrutura do Projeto

```
ocorrencias_pontoV4/
├── src/
│   ├── components/
│   │   ├── ChartPlaceholders.jsx  # Placeholders para gráficos futuros
│   │   ├── DataTable.jsx          # Tabela de dados
│   │   ├── Header.jsx             # Cabeçalho com toggle e exports
│   │   ├── Layout.jsx             # Layout principal
│   │   ├── MainContent.jsx        # Área de conteúdo
│   │   └── Sidebar.jsx            # Menu lateral com filtros
│   ├── contexts/
│   │   ├── FilterContext.jsx      # Contexto de filtros
│   │   └── ThemeContext.jsx       # Contexto de tema
│   ├── hooks/
│   │   ├── useExport.js           # Hook para exportação
│   │   └── useSupabase.js         # Hook para Supabase
│   ├── utils/
│   │   └── supabaseClient.js      # Cliente Supabase
│   ├── App.jsx                    # Componente principal
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Estilos globais
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Como Executar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

O dashboard estará disponível em: `http://localhost:5173/`

### 3. Build para Produção

```bash
npm run build
```

### 4. Preview do Build

```bash
npm run preview
```

## Tecnologias Utilizadas

- **React 18**: Framework frontend
- **Vite**: Build tool e dev server
- **TailwindCSS**: Framework CSS utilitário
- **Supabase**: Backend e banco de dados
- **date-fns**: Manipulação de datas
- **XLSX**: Exportação para Excel

## Estrutura dos Dados

O dashboard trabalha com a tabela `ocorrencias_ponto` do Supabase, com as seguintes colunas:

- `id_registro`: ID único do registro
- `id_colaborador`: ID do colaborador
- `nome`: Nome do colaborador
- `data`: Data da ocorrência
- `escala`: Escala de trabalho
- `codigo_horario`: Código do horário
- `descricao_horario`: Descrição do horário (Folga, DSR, etc)
- `inicio`: Hora de início
- `termino`: Hora de término
- `total_horas`: Total de horas trabalhadas
- `situacao`: Situação da ocorrência
- `total_horas_ocorrencia`: Total de horas da ocorrência

## Próximos Passos

### Gráficos com D3 + Crossfilter + DC.js

O layout já está preparado com 7 espaços para gráficos:
- 3 gráficos na linha superior
- 1 gráfico largo no meio
- 3 gráficos na linha inferior

Para adicionar os gráficos, será necessário:
1. Instalar D3, Crossfilter e DC.js
2. Criar componentes de gráfico
3. Substituir os placeholders pelos gráficos reais

## Paleta de Cores

O dashboard utiliza uma paleta minimalista de tons neutros:

- **Light Mode**: Brancos e cinzas claros
- **Dark Mode**: Pretos e cinzas escuros
- **Transições suaves** entre temas

## Customização

### Alternar Tema
Clique no ícone de sol/lua no canto superior direito do header.

### Filtrar Dados
Use o menu lateral esquerdo para aplicar filtros por:
- Período (data inicial e final)
- Situação (multi-seleção com checkboxes)
- Colaborador (multi-seleção com busca)

### Exportar Dados
Clique nos botões "Exportar CSV" ou "Exportar Excel" no header para baixar os dados filtrados.

### Limpar Filtros
Clique em "Limpar Filtros" no final do menu lateral.

## Licença

Este projeto é privado e desenvolvido para uso interno.
