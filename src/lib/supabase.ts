import { createClient } from '@supabase/supabase-js'

let supabaseInstance: any = null
let supabaseAdminInstance: any = null

function initializeClients() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables not configured')
    return
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey)
  }
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey || supabaseKey)
  }
}

// Initialize at import time
initializeClients()

// Direct exports that lazy-initialize if needed
export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    if (!supabaseInstance) initializeClients()
    if (!supabaseInstance) throw new Error('Supabase not initialized')
    const client = supabaseInstance as any
    const value = client[prop as string]
    return typeof value === 'function' ? value.bind(client) : value
  }
})

export const supabaseAdmin = new Proxy({} as any, {
  get(_target, prop) {
    if (!supabaseAdminInstance) initializeClients()
    if (!supabaseAdminInstance) throw new Error('Supabase not initialized')
    const client = supabaseAdminInstance as any
    const value = client[prop as string]
    return typeof value === 'function' ? value.bind(client) : value
  }
})

