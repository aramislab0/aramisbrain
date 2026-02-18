'use client';

import { createClient } from '@supabase/supabase-js';

// Client-side Supabase pour React Query Provider
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
