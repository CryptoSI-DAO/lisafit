# LisaFit — Agent Guide

## What This Is
LisaFit is a PWA fitness app (Next.js 16 + Supabase) in the Lisa Kim ecosystem. It generates daily bodyweight workouts, scores them, and tracks progress.

## Live URLs
- **Production:** https://lisafit.vercel.app
- **GitHub:** https://github.com/CryptoSI-DAO/lisafit
- **Supabase:** https://db.cryptosidao.org (self-hosted)
- **Local dev:** `/home/lisa/projects/lisafit`

## Commands
```bash
cd /home/lisa/projects/lisafit
npm run dev      # Dev server on :3000
npm run build    # Production build (ALWAYS run before committing)
npm run start    # Serve production build
npm run lint     # ESLint
```

## Critical Conventions
1. **Types** → `src/lib/types.ts` (never inline)
2. **Constants** → `src/lib/constants.ts` (colors, schedules, configs)
3. **DB queries** → `src/lib/workout-api.ts` (pages never call Supabase directly)
4. **Scoring** → `src/lib/scoring.ts` (pure functions, no DB)
5. **Auth guard** → `useRequireAuth()` hook on protected pages
6. **Loading** → `<LoadingScreen />` component (no inline spinners)
7. **DB profile table** is `lisafit_profiles` (NOT `profiles` — that's used by another app)

## Supabase Schema
Tables: `lisafit_profiles`, `exercises`, `daily_workouts`, `exercise_logs`, `weekly_scores`
All have RLS enabled. See `docs/DATABASE.md`.

## Env Vars
- `NEXT_PUBLIC_SUPABASE_URL` — set in `.env.local` and Vercel
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — set in `.env.local` and Vercel

## Deploy
```bash
vercel --prod --yes --token "$VERCEL_TOKEN"
```
Pushes to `main` also auto-deploy via Vercel GitHub integration.

## Gotchas
- The `profiles` table in Supabase belongs to a DIFFERENT app. Always use `lisafit_profiles`.
- Email confirmation is DISABLED on this Supabase instance — signups get a session immediately.
- The workout engine is seeded by date: same date = same workout for all users.
- Tailwind v4 uses `@import "tailwindcss"` (not `@tailwind base`).
- Next.js 16 App Router — all pages are Server Components by default unless `"use client"` is at the top.
