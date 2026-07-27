# LisaFit Database Schema

All tables are in the `public` schema on the self-hosted Supabase instance at `https://db.cryptosidao.org`.

## Tables

### `lisafit_profiles`
Extends `auth.users` with fitness-specific data. Auto-created via trigger on signup.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | — | FK → `auth.users.id` |
| `display_name` | TEXT | YES | — | User's display name |
| `created_at` | TIMESTAMPTZ | YES | `now()` | |
| `updated_at` | TIMESTAMPTZ | YES | `now()` | |

**Trigger:** `on_auth_user_created` — fires `AFTER INSERT` on `auth.users`, calls `handle_new_user()` which inserts a profile row with the display name from user metadata or the email prefix.

---

### `exercises`
Master catalog of exercises. Readable by all authenticated users.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | |
| `name` | TEXT | NO | — | e.g. "Push-ups" |
| `category` | TEXT | NO | `'bodyweight'` | Future: `gym`, `outdoor` |
| `muscle_group` | TEXT | NO | `'fullbody'` | `push\|pull\|legs\|core\|cardio\|fullbody\|mobility` |
| `unit` | TEXT | NO | `'reps'` | `reps\|seconds` |
| `base_target` | INT | NO | `20` | Default target for a "normal" day |
| `difficulty` | TEXT | NO | `'normal'` | `easy\|normal\|hard` |
| `description` | TEXT | YES | — | How-to text |
| `is_active` | BOOLEAN | YES | `true` | Soft-delete flag |
| `created_at` | TIMESTAMPTZ | YES | `now()` | |

**Seeded with:** 28 bodyweight exercises across all muscle groups.

---

### `daily_workouts`
One record per user per day.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | |
| `user_id` | UUID | NO | — | FK → `auth.users.id` |
| `workout_date` | DATE | NO | — | The workout date |
| `day_type` | TEXT | NO | `'normal'` | `easy\|normal\|tough\|rest` |
| `status` | TEXT | NO | `'pending'` | `pending\|in_progress\|completed\|skipped` |
| `total_score` | INT | YES | `0` | Sum of all exercise scores |
| `completed_at` | TIMESTAMPTZ | YES | — | When the workout was finished |
| `created_at` | TIMESTAMPTZ | YES | `now()` | |

**Constraint:** `UNIQUE(user_id, workout_date)` — one workout per day per user.

---

### `exercise_logs`
Individual exercise results within a daily workout.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | |
| `workout_id` | UUID | NO | — | FK → `daily_workouts.id` |
| `exercise_id` | UUID | NO | — | FK → `exercises.id` |
| `exercise_name` | TEXT | NO | — | Denormalized for history queries |
| `unit` | TEXT | NO | `'reps'` | |
| `target` | INT | NO | — | Day-adjusted target |
| `actual` | INT | YES | `0` | User's actual reps/seconds |
| `score` | INT | YES | `0` | 0-100 |
| `completed` | BOOLEAN | YES | `false` | |
| `position` | INT | NO | `0` | Order in the workout |
| `created_at` | TIMESTAMPTZ | YES | `now()` | |

---

### `weekly_scores`
Aggregated Mon-Fri scores. (Reserved for future use — currently computed client-side.)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | |
| `user_id` | UUID | NO | — | FK → `auth.users.id` |
| `week_start` | DATE | NO | — | Always a Monday |
| `week_end` | DATE | NO | — | Always a Friday |
| `total_score` | INT | YES | `0` | |
| `days_completed` | INT | YES | `0` | |
| `days_active` | INT | YES | `0` | |
| `avg_daily_score` | NUMERIC(5,1) | YES | `0` | |
| `created_at` | TIMESTAMPTZ | YES | `now()` | |
| `updated_at` | TIMESTAMPTZ | YES | `now()` | |

**Constraint:** `UNIQUE(user_id, week_start)`

---

## Row Level Security (RLS)

All tables have RLS enabled. Summary:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `lisafit_profiles` | Own row only | Own row only | Own row only | — |
| `exercises` | All authenticated | — | — | — |
| `daily_workouts` | Own rows only | Own rows only | Own rows only | — |
| `exercise_logs` | Via workout ownership | Via workout ownership | Via workout ownership | — |
| `weekly_scores` | Own rows only | Own rows only | Own rows only | — |

The `exercise_logs` policies check ownership through a subquery:
```sql
EXISTS (
  SELECT 1 FROM daily_workouts
  WHERE daily_workouts.id = exercise_logs.workout_id
  AND daily_workouts.user_id = auth.uid()
)
```

## Adding New Exercises

```sql
INSERT INTO exercises (name, category, muscle_group, unit, base_target, difficulty, description)
VALUES ('New Exercise', 'bodyweight', 'core', 'reps', 25, 'normal', 'Description here');
```

The exercise will automatically be picked up by the workout engine on the next generation cycle.
