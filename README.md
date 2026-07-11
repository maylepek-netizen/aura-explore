# aura-explore

A standalone site for viewing pre-made autism simulations. Unlike the main AURA
simulator, aura-explore has no chat and no AI generation — it reads a library of
simulations from Supabase and lets people browse and watch them.

## Screens

- **`/`** — Landing. AURA wordmark, tagline, and an **Enter** button.
- **`/explore`** — Grid of simulation cards (2 columns on mobile, 3 on desktop),
  each showing the situation and a sensory-load bar. Click to open.
- **`/simulation/[id]`** — The viewer. Mobile-first portrait layout with a fixed
  metrics top bar, a vignetted looping video, and a draggable/collapsible bottom
  sheet of thoughts and context. On desktop it becomes a three-column layout
  (context panels left/right, video center).

## Environment variables

Create a `.env.local` file in the project root (already git-ignored):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Both are required — the app reads them in `lib/supabase.ts` to create the
Supabase client. When deploying (e.g. to Vercel), set the same two variables in
the project's environment settings.

## Data

Rows come from the Supabase `simulations` table with these fields:

| field                 | notes                                                        |
| --------------------- | ------------------------------------------------------------ |
| `id`                  | primary key, used in the `/simulation/[id]` route            |
| `situation`           | short description shown on cards and in the viewer           |
| `video_url`           | looping, muted, autoplaying background video                 |
| `internal_thoughts`   | ` \| `-separated thoughts; trailing `[tags]` become chips     |
| `sensory_load`        | single integer; drives the sensory bar and top-bar metrics  |
| `emotional_landscape` | optional prose section (hidden when empty)                   |
| `soundscape`          | optional prose section (hidden when empty)                   |
| `objective`           | optional prose section (hidden when empty)                   |
| `visual_effect`       | reserved for future visual treatments                        |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
```
