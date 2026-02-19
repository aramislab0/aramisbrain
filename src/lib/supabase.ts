import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

// Lazy singleton — NEVER creates client at import time
// Only called inside API route handlers at request time
export function getSupabaseClient(): SupabaseClient {
    if (_supabase) return _supabase

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    _supabase = createClient(supabaseUrl, supabaseAnonKey)
    return _supabase
}
