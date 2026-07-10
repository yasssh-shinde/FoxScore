import { createClient } from '@supabase/supabase-js'

let supabase: any = null
let supabaseAdmin: any = null

function initializeClients() {
  if (supabase && supabaseAdmin) return

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('supabaseUrl and supabaseKey are required')
  }

  supabase = createClient(supabaseUrl, supabaseKey)
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey)
}

export function getSupabase() {
  initializeClients()
  return supabase
}

export function getSupabaseAdmin() {
  initializeClients()
  return supabaseAdmin
}

// For backward compatibility, try to initialize at import time but don't fail
try {
  initializeClients()
} catch {
  // Will be initialized when first used
}

