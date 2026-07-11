import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

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

export async function getSimulations(): Promise<Simulation[]> {
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .order('id', { ascending: false })
  if (error) return []
  return (data as Simulation[]) || []
}

export async function getSimulation(id: number): Promise<Simulation | null> {
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return (data as Simulation) || null
}
