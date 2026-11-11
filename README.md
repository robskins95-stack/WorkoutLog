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
- **Default for new walks:** Assume unweighted unless the user specifies a weighted vest. Keep `vest_weight_lb` blank for unweighted walks (not zero). If pace and heart rate together seem unusually high for an unweighted walk, ask whether a vest was worn rather than silently classifying it as weighted. Do not infer vest use from heart rate alone.

## Historical backfill

- **2026-11-01:** Two 20-second side-plank sets on each side (4 rows in `sets.csv`).
- **2026-10-04:** A full dumbbell session was reported, but no reliable set-level details were available; preserved in `historical_notes.csv`.
- **2026-10-05:** Additional dumbbell floor presses and curls were reported without reliable set-level details; preserved in `historical_notes.csv`.
- **2026-10-05 through 2026-10-27:** 14 individually reported cardio sessions reconstructed in `cardio.csv`. This is **not an exhaustive record of every walk**.
- A 2026-10-26 walk was not added as a measured cardio session because the Fitbit recording continued long after the walk ended; the reconstructed distance and pace are uncertain.
- No suggested-but-unconfirmed exercises have been backfilled.

Historical sources are conversation reports and screenshots, not direct imports from Fitbit. More accurate historical data can be added when available.


## Dashboard

The repository now includes a mobile-friendly, read-only web dashboard:

- \`index.html\` — responsive layout and navigation
- \`dashboard.js\` — CSV parsing, summary statistics, walking pace and distance charts, filters, strength sets, muscle coverage, and historical notes

It loads \`cardio.csv\`, \`sets.csv\`, \`exercises.csv\`, and \`historical_notes.csv\` **from the same directory** each time the page is opened, so subsequent CSV updates appear without rebuilding the dashboard.

### Preview locally

Download or clone the repository and run this command in its root folder:

    python3 -m http.server 8000

Then open \`http://localhost:8000/\` in a browser. On Windows, \`py -m http.server 8000\` may work instead.

Alternatively, open \`index.html\` directly and use the file pickers that appear if the browser blocks automatic CSV loading. These are read-only and do not write to GitHub.

### Publishing and privacy

**GitHub Pages has not been enabled or published.** The source repository is private. If you decide to deploy a public static site, assume the displayed workout history and the CSV files may become publicly accessible even though the repository itself is private. Review GitHub Pages plan support and access controls before publishing.

### Data interpretation

- Muscle coverage counts confirmed set rows by primary muscle group; it is not a precise estimate of physiological training volume.
- Walking charts use only sessions with reported duration and distance. Incomplete sessions remain in the history with missing metrics blank.
- Distance totals include only the sessions explicitly recorded in \`cardio.csv\`, not all walking activity.
- No workout history is sent to a third-party analytics service.
