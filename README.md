# 💛 LisaFit

**Train with Lisa. Score yourself. Beat your best.**

A PWA fitness app with AI-generated daily workouts, scoring, and progress tracking. Built with the Lisa Kim brand aesthetic (neon yellow + black).

## Features

- **Daily workouts** — 5-10 exercises generated fresh each day
- **Smart scheduling** — Easy/Normal/Tough/Rest rotation (Mon-Sun)
- **Scoring** — 0-100 per exercise based on target vs actual
- **Progress tracking** — Weekly charts, streaks, history
- **PWA** — Installable, offline-capable, mobile-first
- **Privacy** — Your data only (Supabase RLS)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL + Auth) |
| Hosting | Vercel |
| PWA | Custom manifest + service worker |

## Getting Started

```bash
npm install
npm run dev
```

Set up `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Day Schedule

| Day | Type | Exercises |
|-----|------|-----------|
| Monday | Normal | 7 |
| Tuesday | Tough | 10 |
| Wednesday | Easy | 5 |
| Thursday | Normal | 7 |
| Friday | Tough | 10 |
| Saturday | Easy | 5 |
| Sunday | Rest | 0 |

## License

MIT © CryptoSI DAO
