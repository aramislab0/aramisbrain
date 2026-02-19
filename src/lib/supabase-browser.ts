'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

// Lazy-init for client-side (avoids build-time crash)
export function getSupabaseBrowser(): SupabaseClient {
    if (_client) return _client;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    _client = createClient(supabaseUrl, supabaseAnonKey);
    return _client;
}

// Backward compat export
export const supabaseBrowser = typeof window !== 'undefined'
    ? getSupabaseBrowser()
    : (null as unknown as SupabaseClient);
