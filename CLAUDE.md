# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm install    # Install dependencies
npm run dev    # Start development server (Vite) at http://localhost:5173
npm run build  # Production build
npm run preview # Preview production build
```

No test framework is configured in this project.

## Environment Setup

Copy `.env.example` to `.env` and configure:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_SUPABASE_TABLE_NAME` - Table name (default: `ocorrencias_ponto`)

## Architecture

This is a React dashboard for visualizing employee time/attendance occurrences ("ocorrências de ponto"), built with Vite + TailwindCSS.

### Context Hierarchy

The app uses nested React contexts in this order (see `src/App.jsx`):
```
ThemeProvider → AuthProvider → DataProvider → FilterProvider → AppContent
```

- **ThemeContext**: Dark/light mode with localStorage persistence
- **AuthContext**: Supabase authentication (email/password)
- **DataContext**: Fetches all data from Supabase with pagination (1000 records per batch), enriches with `base` field from `ativos` table
- **FilterContext**: Client-side filtering by date range, situação, colaborador, matrícula, base

### Data Flow

1. `AuthContext` handles Supabase auth state
2. Once authenticated, `DataContext` fetches all records from `ocorrencias_ponto` table
3. Data is enriched by joining with `ativos` table (id_colaborador → base)
4. `FilterContext` provides filter state used by components to filter data client-side
5. Charts and tables consume filtered data via custom hooks (`useChartData`, `useTableData`)

### Supabase Tables

- `ocorrencias_ponto`: Main table with attendance records (id_registro, id_colaborador, nome, data, situacao, etc.)
- `ativos`: Employee lookup table with `id` and `base` fields

### Key Components

- `Layout.jsx`: Main layout with Header, Sidebar, and MainContent
- `Sidebar.jsx`: Filter controls (date range, situação, colaborador, base)
- `MainContent.jsx`: Dashboard content with charts and data table
- Chart components use D3.js for visualization
