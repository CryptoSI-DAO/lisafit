# LisaFit Architecture

## Overview

LisaFit is a PWA fitness app built on Next.js 16 with Supabase backend. The architecture follows a clean separation between presentation (components), business logic (lib), and data access (workout-api).

```
┌─────────────────────────────────────────────────────┐
│                    Browser / PWA                     │
│                                                      │
│  ┌─────────────┐  ┌───────────┐  ┌───────────────┐ │
│  │  Landing    │  │   Auth    │  │  Today        │ │
│  │  (public)   │  │  (public) │  │  (protected)  │ │
│  └─────────────┘  └───────────┘  └───────────────┘ │
│                                                      │
│  ┌─────────────┐  ┌───────────┐                     │
│  │  History    │  │  Profile  │  ← All protected    │
│  │  (protected)│  │(protected)│     by useRequireAuth│
│  └─────────────┘  └───────────┘                     │
│                                                      │
│  ─────────────── Components ──────────────────────  │
│  workout/  history/  profile/  shared (nav, logo)   │
│                                                      │
│  ─────────────────── Lib ─────────────────────────  │
│  auth-context   workout-api   workout-engine        │
│  useRequireAuth scoring       constants   types     │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ HTTPS (Supabase JS SDK)
                       ▼
┌─────────────────────────────────────────────────────┐
│                   Supabase                           │
│                                                      │
│  ┌─────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │  Auth   │  │ PostgreSQL│  │  Row Level Sec.  │  │
│  │ (GoTrue)│  │           │  │  (user isolation) │  │
│  └─────────┘  └───────────┘  └──────────────────┘  │
│                                                      │
│  Tables: lisafit_profiles, exercises, daily_workouts│
│          exercise_logs, weekly_scores               │
└─────────────────────────────────────────────────────┘
```

## Data Flow

### Workout Generation Flow

```
User opens /today
    │
    ▼
useRequireAuth() → redirects if not logged in
    │
    ▼
getTodaysWorkout(userId)
    │
    ├── Workout exists? → Return it
    │
    └── No workout? → Generate new:
         │
         ▼
        Fetch active exercises from Supabase
         │
         ▼
        generateWorkout(exercises, date)
         │  ├── getDayType(date) → "tough"
         │  ├── Filter by difficulty distribution
         │  ├── Seeded shuffle (deterministic)
         │  ├── Pick with muscle group diversity
         │  └── Apply target multiplier (1.3x for tough)
         │
         ▼
        Insert daily_workouts + exercise_logs
         │
         ▼
        Return workout with logs
```

### Scoring Flow

```
User enters reps → handleLogResult()
    │
    ▼
updateExerciseLog(logId, actual)
    │
    ├── scoreExercise(actual, target) → 0-100
    │
    └── UPDATE exercise_logs SET actual, score, completed
         │
         ▼
User finishes all exercises → handleFinish()
    │
    ▼
completeWorkout(workoutId)
    │
    ├── SUM all exercise scores → totalScore
    │
    └── UPDATE daily_workouts SET status='completed', total_score
```

## Key Design Decisions

### 1. Seeded Workout Generation
Workouts are deterministic per date, not per user. This means:
- All users get the same workout on the same day
- Fair for future leaderboards
- No server-side state needed for generation

### 2. Client-Side Generation
The workout engine runs in the browser, not on a server. The client:
1. Fetches the exercise catalog
2. Runs the generation algorithm
3. Persists the result to Supabase

This keeps server costs at zero and allows offline-first in the future.

### 3. RLS-Only Security
All data access is through Supabase's Row Level Security policies. There's no API middleware — the client talks to Supabase directly with the anon key, and RLS ensures users can only access their own data.

### 4. Progressive Enhancement
The service worker only activates in production. Auth and data fetching work without it — the SW just adds offline fallback for the app shell.
