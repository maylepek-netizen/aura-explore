import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type Simulation = {
  id: number
  situation: string | null
  video_url: string | null
  internal_thoughts: string | null
  sensory_load: number | null
  emotional_landscape: string | null
  soundscape: string | null
  objective: string | null
  visual_effect: string | null
}

let _supabase: SupabaseClient | null = null

// Lazily create the client so a missing env var doesn't crash the build/import.
// The fetch helpers below fall back to empty results when it returns null.
function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  if (!_supabase) _supabase = createClient(url, key)
  return _supabase
}

// Records whose Cloudinary asset was deleted from the account. Their rows still
// carry a well-formed URL, so no filter can spot them by shape — the URL simply
// 404s. Verified dead by HEAD probe on 2026-07-18; listing them here keeps a
// dead simulation from ever being opened, without paying for a liveness request
// on every page load.
const DEAD_SIMULATION_IDS = [36, 41]

export async function getSimulations(): Promise<Simulation[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .filter('video_url', 'like', 'https://res.cloudinary.com%')
    .not('id', 'in', `(${DEAD_SIMULATION_IDS.join(',')})`)
    .order('id', { ascending: false })
  if (error) return []
  return (data as Simulation[]) || []
}

export async function getSimulationById(id: number): Promise<Simulation | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return (data as Simulation) || null
}
