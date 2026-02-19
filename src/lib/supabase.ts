import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

// Lazy-init: only create client when first called (not at build time)
export function getSupabaseClient(): SupabaseClient {
    if (_supabase) return _supabase

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables')
    }

    _supabase = createClient(supabaseUrl, supabaseAnonKey)
    return _supabase
}

// Keep backward compat for client-side imports
export const supabase = typeof window !== 'undefined'
    ? getSupabaseClient()
    : (null as unknown as SupabaseClient)
