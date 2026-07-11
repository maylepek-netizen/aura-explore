// Helpers for turning the raw Supabase fields into UI-ready values.
//
// The `simulations` table stores `sensory_load` as a single integer with no
// fixed scale (observed range ~8–510). The design calls for three distinct
// top-bar metrics — ANXIETY, SOUND, OVERSTIMULATION — so we derive them
// deterministically from that one number. This is presentational: the same
// input always yields the same three readings, giving the top bar life without
// fabricating data that isn't in the database.

// Treat this as the "full" ceiling for the raw sensory_load value.
const SENSORY_CEILING = 500

/** Normalize raw sensory_load to a 0–100 intensity. */
export function sensoryIntensity(raw: number | null | undefined): number {
  const v = typeof raw === 'number' && isFinite(raw) ? raw : 0
  return Math.max(0, Math.min(100, Math.round((v / SENSORY_CEILING) * 100)))
}

export type Metric = {
  label: string
  /** 0–100 */
  value: number
  color: string
}

/**
 * Derive the three top-bar metrics from a single sensory_load value.
 * ANXIETY and OVERSTIMULATION track the load closely; SOUND is offset so the
 * three bars read as related-but-distinct rather than identical.
 */
export function deriveMetrics(raw: number | null | undefined): Metric[] {
  const base = sensoryIntensity(raw)
  const clamp = (n: number) => Math.max(4, Math.min(100, Math.round(n)))
  return [
    { label: 'ANXIETY', value: clamp(base * 0.9 + 8), color: 'var(--aura-pink)' },
    { label: 'SOUND', value: clamp(base * 1.05), color: 'var(--aura-periwinkle)' },
    {
      label: 'OVERSTIMULATION',
      value: clamp(base * 0.8 + 12),
      color: 'var(--aura-peach)',
    },
  ]
}

/**
 * `internal_thoughts` is a single string with individual thoughts separated by
 * " | ". Some thoughts carry a trailing bracketed concept tag, e.g.
 * "…This is exhausting. [Masking]". Split into { text, tag } fragments.
 */
export type Thought = { text: string; tag: string | null }

export function parseThoughts(raw: string | null | undefined): Thought[] {
  if (!raw) return []
  return raw
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((chunk) => {
      const match = chunk.match(/\[([^\]]+)\]\s*$/)
      if (match) {
        return { text: chunk.slice(0, match.index).trim(), tag: match[1].trim() }
      }
      return { text: chunk, tag: null }
    })
}
