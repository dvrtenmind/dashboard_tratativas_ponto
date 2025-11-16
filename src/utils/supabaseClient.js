import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase a partir das variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validação das variáveis de ambiente
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('As variáveis de ambiente do Supabase não foram configuradas. Verifique o arquivo .env')
}

// Cria e exporta o cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Nome da tabela
export const TABLE_NAME = import.meta.env.VITE_SUPABASE_TABLE_NAME || 'ocorrencias_ponto'
