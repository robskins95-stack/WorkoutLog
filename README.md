# WorkoutLog

A simple, human-readable strength and core workout log.

## Files

- `exercises.csv`: exercise catalog, including equipment, resistance convention, and primary/secondary muscles.
- `sets.csv`: one row per completed set **per side**, allowing different weights, reps, durations, and notes.

## Conventions

- `date`: local date (YYYY-MM-DD).
- `session_id`: YYYYMMDD-01, -02, etc.
- `exercise_id`: stable key referencing `exercises.csv`.
- `set_number`: numbered per exercise within a session. Left/right sides of one round share the same set number.
- `side`: left, right, both, or blank if not applicable.
- `weight_lb`: external resistance in pounds, using the exercise's `weight_basis`. For two-dumbbell movements, log **one dumbbell's weight**. Blank for unweighted bodyweight exercises.
- `reps` or `duration_seconds`: record actual completed repetitions or hold duration.
- `planned_reps`: optional target, only when known.
- `effort`: optional easy, moderate, hard, or max, only when reported.
- `stop_reason`: optional (e.g., completed, back_tightness, form_breakdown), only when known.
- `notes`: user-reported observations, not inferred facts.

## Initial backfill

On 2026-11-01 the user reported side planks: 2 sets of 20 seconds on each side. These four rows are entered in `sets.csv`; effort and weight are left blank because they weren't supplied.

Other entries in `exercises.csv` are **definitions**, not assertions of completed sets. Historical exercises mentioned without exact set details were not invented. Walking/cardio is outside this first strength-and-core set log; it can be added later as a separate activity file if desired.
