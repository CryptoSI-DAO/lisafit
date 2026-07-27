# LisaFit Product Roadmap

## Current State (v1.0)
- ✅ Bodyweight exercises (28 in catalog)
- ✅ Daily workout generation (easy/normal/tough/rest)
- ✅ Per-exercise scoring (0-100)
- ✅ Weekly bar chart + streak tracking
- ✅ PWA installable (Android + iOS)
- ✅ Supabase auth (email/password)
- ✅ RLS-secured data

---

## Planned Features

### Gym Workouts (v2.0)
**Goal:** Add gym-based exercises with equipment.

**Implementation:**
1. Add `category: "gym"` rows to the `exercises` table
2. Add a workout-type setting to `lisafit_profiles` (`bodyweight | gym | mixed`)
3. Filter exercise catalog by user's preferred category in `getTodaysWorkout()`
4. Add a settings page to `profile/`
5. No changes needed to scoring, history, or UI components

**Estimated effort:** 1-2 days

---

### Outdoor Workouts (v2.1)
**Goal:** Running, cycling, hiking tracking.

**Implementation:**
1. Add `category: "outdoor"` exercises with distance/time units
2. Add `unit: "meters"` and `unit: "minutes"` to exercise schema
3. Create outdoor-specific exercise cards (GPS optional)
4. Integrate with device sensors for future iteration

**Estimated effort:** 2-3 days

---

### Social & Leaderboards (v3.0)
**Goal:** Friends, weekly competitions, global leaderboard.

**Implementation:**
1. New tables: `friends`, `friend_requests`, `leaderboards`
2. Since workouts are already seeded per-date (all users same workout), leaderboard comparison is fair
3. Add `/social` route with bottom nav tab
4. Weekly scores table (`weekly_scores`) already exists — just needs server-side aggregation
5. Real-time updates via Supabase Realtime subscriptions

**Estimated effort:** 3-5 days

---

### Analytics Dashboard (v3.1)
**Goal:** Detailed insights — muscle group balance, improvement trends, personal bests.

**Implementation:**
1. New `/analytics` route
2. Aggregate exercise_logs by muscle_group for balance visualization
3. Track personal bests per exercise (max query)
4. Show 30/60/90-day improvement trend lines
5. All data already exists — pure query + visualization work

**Estimated effort:** 2 days

---

### Gamification (v4.0)
**Goal:** Badges, levels, XP system.

**Implementation:**
1. New tables: `badges`, `user_badges`, `user_xp`
2. Award XP on workout completion (totalScore = XP)
3. Badge triggers: first workout, 7-day streak, 1000 total points, etc.
4. Level thresholds based on cumulative XP
5. Show badge progress on profile

**Estimated effort:** 2-3 days

---

## Technical Debt & Improvements

- [ ] Add E2E tests (Playwright)
- [ ] Add unit tests for scoring + workout engine
- [ ] Implement offline-first with Supabase local persistence
- [ ] Add push notifications for daily workout reminder
- [ ] Add Apple Health / Google Fit integration
- [ ] Optimize images (WebP conversion)
- [ ] Add proper error boundaries with retry buttons

---

## Architecture Notes for Future Features

The refactored codebase is designed so that:

1. **Adding an exercise category** = seed new rows + add one filter. Nothing else changes.
2. **Adding a new page** = create route, use `useRequireAuth()`, import components. Zero boilerplate.
3. **Changing scoring** = edit `scoring.ts`. Every component picks up the change.
4. **Adding a new day type** = add to `DAY_TYPE_CONFIG` + `DIFFICULTY_DISTRIBUTION`. Engine picks it up.
5. **Theming** = all colors in `constants.ts`. Change once, updates everywhere.
