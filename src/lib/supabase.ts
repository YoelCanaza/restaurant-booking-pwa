import { createClient } from '@supabase/supabase-js'

/**
 * Cliente único de Supabase para toda la app.
 * Credenciales en .env (local) y en las env vars de Vercel (producción).
 * La anon key es pública por diseño: la seguridad la imponen las políticas
 * RLS de Postgres, nunca el secreto de esta key.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copia .env.example como .env y completa las credenciales.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
