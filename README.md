# WorkoutLog

A human-readable workout history, organized for future progress analysis.

## Files

- `exercises.csv` — catalog of exercise names, equipment, weight conventions, primary and secondary muscles. A catalog entry **does not mean an exercise was completed**.
- `sets.csv` — one row per completed strength/core set per side; weights, reps, hold durations, effort and user notes.
- `cardio.csv` — one row per reported walking/treadmill/weighted-vest session, with duration, distance, optional Fitbit metrics and vest weight.
- `historical_notes.csv` — reported strength work for which the exact sets/reps/weights cannot currently be reconstructed. These rows are **not counted as completed sets**.

## Strength/core conventions

- `date`: local date (YYYY-MM-DD); `session_id`: YYYYMMDD-01, -02, etc. (IDs are unique within each file, not globally across different files).
- `exercise_id`: stable key referencing `exercises.csv`.
- `set_number`: per exercise within a session. Left and right of one round share a number.
- `side`: left, right, both, or blank if not applicable.
- `weight_lb`: external resistance in pounds using the catalog's `weight_basis`. For two-dumbbell movements, log the weight **per dumbbell**, not their combined weight. Leave blank for unweighted bodyweight work.
- `reps` or `duration_seconds`: actual completed repetitions or duration.
- `planned_reps`, `effort` (easy/moderate/hard/max), `stop_reason`, and `notes` are optional. Record only user-reported information, not assumptions.

## Cardio conventions

- Distances in miles; durations in seconds; heart rate in bpm; vest weight in pounds.
- `data_quality=confirmed` means the recorded values were explicitly reported in the conversation or accompanying workout screenshot; **it does not imply Fitbit measurements are medically precise**.
- `data_quality=partial` means some measurements were not supplied.
- Blank means unknown or not applicable, **not zero**.
- Fitbit zone minutes may double-count vigorous-intensity minutes according to Fitbit's method.

## Historical backfill

- **2026-11-01:** Two 20-second side-plank sets on each side (4 rows in `sets.csv`).
- **2026-10-04:** A full dumbbell session was reported, but no reliable set-level details were available; preserved in `historical_notes.csv`.
- **2026-10-05:** Additional dumbbell floor presses and curls were reported without reliable set-level details; preserved in `historical_notes.csv`.
- **2026-10-05 through 2026-10-27:** 14 individually reported cardio sessions reconstructed in `cardio.csv`. This is **not an exhaustive record of every walk**.
- A 2026-10-26 walk was not added as a measured cardio session because the Fitbit recording continued long after the walk ended; the reconstructed distance and pace are uncertain.
- No suggested-but-unconfirmed exercises have been backfilled.

Historical sources are conversation reports and screenshots, not direct imports from Fitbit. More accurate historical data can be added when available.
