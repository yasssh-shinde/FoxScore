import { createClient } from '@supabase/supabase-js'

let supabaseInstance: any = null
let supabaseAdminInstance: any = null
let initialized = false

function initializeClients() {
  if (initialized) return

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  initialized = true

  if (!supabaseUrl || !supabaseKey) {
    return
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey)
  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey || supabaseKey)
}

export function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    initializeClients()
  }
  if (!supabaseAdminInstance) {
    throw new Error('Supabase not initialized. Ensure environment variables are set.')
  }
  return supabaseAdminInstance
}

export function getSupabase() {
  if (!supabaseInstance) {
    initializeClients()
  }
  if (!supabaseInstance) {
    throw new Error('Supabase not initialized. Ensure environment variables are set.')
  }
  return supabaseInstance
}

// Export lazy getter proxy objects for backward compatibility
export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    return getSupabase()[prop as string]
  }
})

export const supabaseAdmin = new Proxy({} as any, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop as string]
  }
})

// Try to initialize at import time, but don't fail
initializeClients()

