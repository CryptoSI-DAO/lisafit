# Contributing to LisaFit

Thanks for building with us! This guide gets you productive in 15 minutes.

## Quick Start

```bash
git clone https://github.com/CryptoSI-DAO/lisafit.git
cd lisafit
npm install
npm run dev
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

App runs at `http://localhost:3000`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL + Auth) |
| Hosting | Vercel |
| PWA | Custom manifest + service worker |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (auth provider, fonts, metadata)
│   ├── page.tsx            # Landing page (unauthenticated)
│   ├── today/              # Daily workout session
│   ├── history/            # Progress dashboard
│   ├── profile/            # User settings + install
│   └── auth/               # Sign in / Sign up
├── components/             # Reusable UI components
│   ├── workout/            # Exercise card, score circle, rest day, completion
│   ├── history/            # Stat cards, weekly chart, history rows
│   ├── profile/            # User card, info rows, future features
│   ├── bottom-nav.tsx      # Tab bar navigation
│   ├── install-button.tsx  # PWA install prompt
│   ├── loading-screen.tsx  # Shared loading states
│   └── logo.tsx            # Brand logo
├── lib/                    # Business logic (no JSX)
│   ├── types.ts            # All shared TypeScript types
│   ├── constants.ts        # Day schedule, difficulty config, colors
│   ├── workout-engine.ts   # Workout generation (pure functions)
│   ├── workout-api.ts      # Supabase queries for workouts
│   ├── scoring.ts          # Score calculation (pure functions)
│   ├── auth-context.tsx    # Auth provider + useAuth hook
│   ├── use-require-auth.ts # Protected route guard hook
│   └── supabase-client.ts  # Supabase client singleton
└── public/                 # Static assets (icons, hero, manifest)
```

## Key Concepts

### Day Types

The app rotates through 4 day types on a weekly cycle:

| Day | Type | Exercises |
|-----|------|-----------|
| Monday | Normal | 7 |
| Tuesday | Tough | 10 |
| Wednesday | Easy | 5 |
| Thursday | Normal | 7 |
| Friday | Tough | 10 |
| Saturday | Easy | 5 |
| Sunday | Rest | 0 |

### Scoring

Each exercise is scored 0-100 based on `actual / target * 100`.

- Hit your target exactly = 100 points
- Half your target = 50 points
- Double your target = still 100 (capped)
- Daily max = exerciseCount × 100

### Seeded Generation

Workouts are deterministic per date. The same date produces the same workout for all users. This ensures fairness for future leaderboard features. The seed is derived from `YYYYMMDD`.

## Coding Conventions

1. **Types live in `lib/types.ts`** — never re-define types inline
2. **Constants live in `lib/constants.ts`** — colors, schedules, configs
3. **DB queries live in `lib/workout-api.ts`** — pages never call Supabase directly
4. **Use the hooks** — `useAuth()` for session, `useRequireAuth()` for protected pages
5. **Use `<LoadingScreen />`** — don't write inline spinner divs
6. **Use Tailwind classes** — no CSS files except `globals.css`
7. **Mobile-first** — design for 375px width, then scale up

## PR Checklist

- [ ] `npm run build` passes with no errors
- [ ] No `console.log` statements left in code
- [ ] Types are properly defined (no `any`)
- [ ] New constants added to `constants.ts`, not inline
- [ ] New types added to `types.ts`, not inline

## Deployment

Pushes to `main` auto-deploy to Vercel. The production URL is [lisafit.vercel.app](https://lisafit.vercel.app).

Environment variables (set in Vercel dashboard):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
