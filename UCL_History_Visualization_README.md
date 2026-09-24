# UCL History Visualization — Master Project README & Coding-Agent Prompt

## 0. Project brief

Build a polished, data-driven website that visualizes UEFA Champions League performance for 13 selected European clubs across the 31 seasons from **1995/96 through 2025/26**.

The project is not meant to be a simple trophy-count page. It should let a user explore:

- season-by-season UCL finishing stage;
- long-term performance trajectories;
- sustained periods of elite performance (“primes”);
- deep-run frequency and streaks;
- finals and titles;
- club-to-club comparisons;
- season-by-season browsing;
- the effect of major competition-format changes;
- selected match-level context for semifinal/final runs;
- transparent data provenance and verification.

The site should feel like a **premium football-history/data-visualization product**, not an admin dashboard.

The central idea is:

> **Show the history first; derive the analysis second. Never hide the underlying season data behind a black-box score.**

---

# 1. Scope

## 1.1 Seasons

Include exactly these 31 seasons:

- 1995/96
- 1996/97
- 1997/98
- 1998/99
- 1999/2000
- 2000/01
- 2001/02
- 2002/03
- 2003/04
- 2004/05
- 2005/06
- 2006/07
- 2007/08
- 2008/09
- 2009/10
- 2010/11
- 2011/12
- 2012/13
- 2013/14
- 2014/15
- 2015/16
- 2016/17
- 2017/18
- 2018/19
- 2019/20
- 2020/21
- 2021/22
- 2022/23
- 2023/24
- 2024/25
- 2025/26

## 1.2 X-axis convention

Use the **ending year of the season** as the underlying numeric year.

Examples:

- `1995/96` → `1996`
- `1996/97` → `1997`
- `1999/2000` → `2000`
- `2024/25` → `2025`
- `2025/26` → `2026`

For compact chart labels, display two-digit endings:

`96 97 98 99 00 01 ... 23 24 25 26`

Important:

- store `seasonEndYear` as a number;
- store `seasonLabel` as the exact full season string;
- store `axisLabel` as a string so `00` is not rendered as `0`;
- tooltips must show the complete season label, e.g. `2025/26`.

Do not infer the season from a two-digit axis label alone.

---

# 2. Clubs

Use these 13 clubs as the initial fixed dataset.

| Canonical ID | Display name | Common aliases to normalize |
|---|---|---|
| `chelsea` | Chelsea | Chelsea FC, Chelsea London |
| `juventus` | Juventus | Juventus FC, Juventus Torino, FC Juventus |
| `milan` | AC Milan | Milan, Milan AC, AC Milan |
| `inter` | Inter | Internazionale, Inter Milan, Inter Milano |
| `liverpool` | Liverpool | Liverpool FC |
| `bayern` | Bayern Munich | Bayern München, Bayern Munchen |
| `man_utd` | Manchester United | Man United, Manchester Utd, Manchester United FC |
| `man_city` | Manchester City | Man City, Manchester City FC |
| `real_madrid` | Real Madrid | Real Madrid CF, Real Madrid Club de Fútbol |
| `barcelona` | Barcelona | FC Barcelona, Barça |
| `atletico` | Atlético de Madrid | Atletico Madrid, Atlético Madrid, Atlético de Madrid CF |
| `dortmund` | Borussia Dortmund | Dortmund, BV Borussia 09 Dortmund, Borussia Dortmund 09 |
| `psg` | Paris Saint-Germain | PSG, Paris SG, Paris Saint-Germain FC |

Use canonical IDs internally. Do not use display names as database keys.

Keep a separate alias map so source naming differences do not create duplicate clubs.

---

# 3. Core data philosophy

There are **403 club-season observations** in the core dataset:

`13 clubs × 31 seasons = 403 records`

Every club-season must have exactly one canonical status, even when the club did not participate.

This means the dataset should not simply contain seasons in which the 13 clubs played. It should contain the complete 13 × 31 matrix.

For every club-season, record whether the club:

- did not participate;
- entered qualifying and was eliminated there;
- reached the group phase in the older format;
- reached the league phase in the newer format;
- reached a knockout play-off;
- reached the round of 16;
- reached the quarter-final;
- reached the semi-final;
- reached the final and lost;
- won the competition.

This is essential for showing **absence as information** rather than dropping missing seasons.

---

# 4. Competition-format handling

Historical Champions League formats changed over time, so do not pretend that all early-stage labels were identical.

The main visualization should use a normalized display taxonomy, while the data retains the exact historical stage.

Recommended normalized stages, from earliest to deepest:

1. `did_not_participate`
2. `qualifying`
3. `group_phase`
4. `league_phase`
5. `knockout_playoff`
6. `round_of_16`
7. `quarter_final`
8. `semi_final`
9. `runner_up`
10. `winner`

For older seasons, the source may use historically specific stages such as preliminary round, first group stage, second group stage, etc. Preserve that exact wording in `exactStage`, and map it to the appropriate normalized presentation bucket.

Do not silently collapse historically meaningful stages in the raw data.

From the 2024/25 season onward, UEFA changed the competition to a **36-team league phase**, with a knockout phase play-off for clubs finishing 9th–24th before the round of 16. The implementation must therefore distinguish the modern `league_phase` and `knockout_playoff` from the older group-stage structure.

Do not label the 2024/25 or 2025/26 league phase as “Group Stage”.

For analytical comparisons of “deep runs”, use only stages that are structurally comparable across eras, especially QF/SF/Final/Winner.

---

# 5. Source strategy and data provenance

## 5.1 Primary historical reference: RSSSF

Use the **Rec.Sport.Soccer Statistics Foundation (RSSSF)** European Cups Archive and season pages as the primary historical reference/source for match and stage reconstruction where available.

RSSSF is especially valuable because it provides season-by-season European competition results and detailed historical match information.

Useful starting point:

- RSSSF European Cups Archive: `https://www.rsssf.org/ec/`

The archive provides season pages covering the relevant historical period. Examples include:

- `https://www.rsssf.org/ec/ec199596.html`
- `https://www.rsssf.org/ec/ec199697.html`

Do not assume that a single archive index contains every current season forever. Verify the current endpoint and individual season pages before scraping.

## 5.2 Official verification: UEFA

Use UEFA as the official verification/reference source whenever possible.

Useful starting points:

- UEFA Champions League history: `https://www.uefa.com/uefachampionsleague/history/`
- UEFA Champions League competition format: `https://www.uefa.com/uefachampionsleague/competition-format/`
- UEFA season pages and club history pages under `uefa.com/uefachampionsleague/history/`

Use UEFA particularly for:

- semifinal results;
- final results;
- winner/runner-up status;
- modern-format league phase and knockout phase details;
- any record where RSSSF and another source disagree;
- 2025/26 current historical data.

## 5.3 2025/26 special case

Treat 2025/26 as a completed season in the dataset.

For 2025/26, use UEFA's completed-results pages as the authoritative source for the winner, final, semifinal, quarter-final and other knockout stages.

Do not assume the older RSSSF European Cups Archive page has already incorporated 2025/26 simply because the archive is described as “current”. Check the actual season coverage and update date.

## 5.4 Third-source fallback

If a record cannot be resolved confidently from RSSSF + UEFA, use a reputable third source as a **cross-check**, not as the primary authority.

Potential sources include established football statistical/reference sites with season-by-season competition records.

Do not use Wikipedia as the sole verification source.

## 5.5 Data provenance requirements

Every record should be traceable to one or more source pages.

At minimum, retain:

```json
"sources": [
  {
    "provider": "RSSSF",
    "url": "...",
    "role": "historical_reference"
  },
  {
    "provider": "UEFA",
    "url": "...",
    "role": "official_verification"
  }
]
```

Do not copy large blocks of source text. Extract only the structured factual data needed for the project.

Do not hotlink source pages as a runtime data dependency. The site should ship with a local, verified data snapshot.

---

# 6. Data acquisition workflow

Build the data in a reproducible pipeline rather than manually typing 403 rows.

Recommended process:

```text
RSSSF season pages
       +
UEFA season / club pages
       ↓
Raw extraction
       ↓
Club-name normalization
       ↓
Stage normalization
       ↓
13 × 31 matrix completion
       ↓
Validation
       ↓
Manual review of conflicts
       ↓
Clean JSON / CSV
       ↓
Website
```

## Step A — Enumerate seasons

Create a deterministic list of 31 seasons.

Each season should have:

```json
{
  "seasonLabel": "1995/96",
  "seasonEndYear": 1996,
  "axisLabel": "96"
}
```

## Step B — Extract source-level competition data

For each season, identify all stages relevant to the 13 clubs.

Do not scrape only finals.

If a club did not reach a deep stage, trace the competition sufficiently to determine its last stage.

## Step C — Normalize club names

Map aliases to canonical IDs before aggregation.

Normalization must be deterministic.

Example:

```text
"Internazionale"       → inter
"Inter Milan"          → inter
"Paris SG"             → psg
"Paris Saint-Germain"  → psg
"Bayern München"       → bayern
```

Do not merge unrelated historical clubs merely because the names look similar.

## Step D — Determine final stage

For each club-season, record the deepest stage reached.

Example:

```text
Quarter-final reached → normalizedStage = quarter_final
```

A finalist who lost the final should not be classified merely as `final`; use a dedicated `runner_up` outcome in the normalized layer so the visualization can distinguish finalist from winner.

## Step E — Complete the 403 records

After extracting participating seasons, left-join the results onto the full 13 × 31 matrix.

Missing records must be explicitly resolved to either:

- `did_not_participate`; or
- a source-supported stage that was missed during extraction.

Do not leave null stages in the final production dataset unless null is genuinely part of the schema and explained.

## Step F — Verify

Cross-check critical records against UEFA, with special attention to:

- all winners;
- all runner-ups;
- all semifinalists;
- all disputed historical records;
- seasons affected by unusual competition structures;
- seasons around format transitions;
- 2025/26.

---

# 7. Canonical data schema

Use TypeScript interfaces and export a static JSON dataset.

Recommended core schema:

```ts
export type NormalizedStage =
  | "did_not_participate"
  | "qualifying"
  | "group_phase"
  | "league_phase"
  | "knockout_playoff"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "runner_up"
  | "winner";

export interface ClubSeasonRecord {
  teamId: string;
  teamName: string;

  seasonLabel: string;
  seasonEndYear: number;
  axisLabel: string;

  participated: boolean;
  entryStage: string | null;

  normalizedStage: NormalizedStage;
  exactStage: string;

  reachedRoundOf16: boolean;
  reachedQuarterFinal: boolean;
  reachedSemiFinal: boolean;
  reachedFinal: boolean;
  won: boolean;

  leaguePhasePosition?: number | null;
  groupPosition?: number | null;

  finalOpponent?: string | null;
  finalResult?: string | null;

  sources: SourceReference[];
}

export interface SourceReference {
  provider: "RSSSF" | "UEFA" | "Other";
  url: string;
  role: "historical_reference" | "official_verification" | "cross_check";
  note?: string;
}
```

The boolean fields are redundant by design. They make analysis simpler and reduce accidental logic errors in the frontend.

However, they must always be derived from `normalizedStage` or from an authoritative transformation step. Do not maintain contradictory values by hand.

---

# 8. Optional match-level schema

For deeper storytelling, add knockout match-path information where verified.

```ts
export interface KnockoutTie {
  round: "round_of_16" | "quarter_final" | "semi_final" | "final";
  opponent: string;
  firstLeg?: MatchResult | null;
  secondLeg?: MatchResult | null;
  aggregate?: string | null;
  advanced: boolean;
  decidedOnPenalties?: boolean;
}

export interface MatchResult {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  penaltiesHome?: number | null;
  penaltiesAway?: number | null;
}
```

Use this only for high-value deep runs initially, especially semifinals and finals.

Do not let match-level data become a dependency for the core stage timeline.

---

# 9. Stage presentation model

The frontend needs a stable presentation order.

Recommended display order from best to earliest:

```ts
const STAGE_ORDER = [
  "winner",
  "runner_up",
  "semi_final",
  "quarter_final",
  "round_of_16",
  "knockout_playoff",
  "league_phase",
  "group_phase",
  "qualifying",
  "did_not_participate"
];
```

For each stage provide:

- short label;
- long label;
- tooltip description;
- numeric y-position for plotting only;
- whether it counts as a deep run;
- whether it counts as a final appearance.

Example:

```ts
{
  id: "quarter_final",
  label: "QF",
  longLabel: "Quarter-final",
  plotLevel: 3,
  deepRun: true,
  finalAppearance: false,
  title: false
}
```

Important: `plotLevel` is a **visual positioning coordinate**, not a claim that the distance between stages is mathematically meaningful.

Do not calculate averages of plot levels and call the result an objective “UCL performance score.”

---

# 10. Main visualization — UCL Journey

This is the centerpiece.

## Goal

Answer:

> “How did this club perform across the UCL era?”

## Design

X-axis:

`96 97 98 99 00 ... 24 25 26`

Y-axis:

```text
Winner
Runner-up
Semi-final
Quarter-final
Round of 16
Knockout play-off
League phase
Group phase
Qualifying
Did not participate
```

Each season is represented by a point, marker or compact cell positioned at its deepest stage.

The exact visual language can be a custom SVG/D3 chart.

Recommended interactions:

- hover/tap a season → show full season information;
- click a season → open a season detail panel;
- select a club → update the whole visualization;
- optionally compare multiple clubs;
- zoom or horizontal scroll only if necessary on mobile;
- preserve readable labels.

Tooltip example:

```text
2025/26
Paris Saint-Germain
Winner

Final: PSG 1–1 Arsenal
Penalties: 4–3

Sources
UEFA · RSSSF/cross-check when available
```

Do not show only a colored dot with no text explanation on touch devices.

---

# 11. Heatmap visualization

Create a 13 × 31 heatmap.

Rows = clubs.

Columns = season ending years.

Each cell encodes normalized stage.

Example structure:

```text
                    96 97 98 99 00 ... 24 25 26
Chelsea             ·  ·  QF ...         W  QF SF
Juventus             QF SF ...
AC Milan              ...
...
PSG                   ...
```

Requirements:

- every club must have every season cell;
- never omit non-participation;
- strong visual distinction between winner/final/SF/QF/R16 and earlier exits;
- include a legend;
- hover/tap shows exact stage and season;
- support filtering to one or multiple clubs.

This is the best overview visualization for spotting sustained eras at a glance.

---

# 12. Prime analysis

“Prime” is an analytical concept and must be defined explicitly in the UI.

Do not write a vague statement such as “we calculated the prime using our formula” without showing the ingredients.

Use multiple prime concepts rather than a single opaque score.

## 12.1 Peak season

The deepest single-season outcome for a club.

Priority:

1. winner;
2. runner-up;
3. semifinal;
4. quarter-final;
5. round of 16;
6. etc.

If several seasons tie at the deepest stage, list all tied peak seasons or use additional context to describe the peak.

## 12.2 Sustained prime window

Use a rolling **5-season window** as the default.

For each club and each 5-season interval, calculate:

- number of QF+ seasons;
- number of SF+ seasons;
- number of final appearances;
- number of titles.

Example:

```text
2009  2010  2011  2012  2013
 QF    SF    SF     W    QF

QF+ = 5
SF+ = 3
Final = 1
Wins = 1
```

Define the primary sustained-prime window as the window with:

1. maximum QF+ count;
2. tie-break by maximum SF+ count;
3. tie-break by maximum finals count;
4. tie-break by maximum wins;
5. if still tied, retain multiple prime windows rather than inventing a winner.

Do not reduce the window to a single arbitrary score.

## 12.3 Prime density

For a selected five-season window:

```text
primeDensity = QF+ seasons / 5
```

This is descriptive, not a universal quality metric.

Display it as:

`4 / 5 seasons reached the quarter-finals or better`

rather than merely showing `80%`.

## 12.4 Strongest sustained period

Present a human-readable summary:

```text
Strongest 5-season period
2009–2013

QF+      5/5
SF+      3/5
Finals   1
Titles   1
```

If two windows are tied, show both.

## 12.5 Optional sensitivity analysis

Allow an advanced toggle for 3-year and 7-year windows.

This is useful because a “prime” can depend on the chosen window size.

The default public UI should remain 5 years to avoid clutter.

---

# 13. Deep-run frequency

Create a visualization showing how often each club reached at least the quarter-final.

Primary definition:

`QF+ = Quarter-final, Semi-final, Runner-up, Winner`

For each club calculate:

- total QF+ seasons;
- total SF+ seasons;
- total finals;
- total titles;
- percentage of participating seasons reaching QF+.

Show both count and denominator when relevant.

Do not compare QF+ percentage using all 31 seasons if a large share of those seasons were non-participation unless the UI clearly says that it is calculated over all seasons.

Prefer two values:

```text
QF+ appearances: 12
QF+ rate among UCL participations: 48%
```

This prevents non-qualification from being silently mixed with poor in-tournament performance.

---

# 14. Streak analysis

Compute streaks such as:

- longest R16+ streak;
- longest QF+ streak;
- longest SF+ streak;
- longest final-appearance streak;
- longest title streak.

Represent them with horizontal duration bars or a compact table.

Example:

```text
Quarter-final+ streak
2008 ━━━━━━━━━ 2015
8 consecutive seasons
```

If there is no streak, display `0` rather than a blank.

---

# 15. Finals timeline

Create a dedicated finals-only timeline.

For each final appearance show:

- season;
- winner/runner-up status;
- opponent;
- score when verified;
- penalties when applicable.

Example concept:

```text
Chelsea
96 ─────────────────────────────── 26

          ●          ★
         2008       2012
```

Legend:

- `★` = winner
- `●` = runner-up

The actual visual should use accessible labels/tooltips in addition to symbols.

---

# 16. Cumulative title chart

Create an optional line chart of cumulative UCL titles over time.

For every club:

```text
cumulativeTitles(year)
```

Do not imply that cumulative titles alone describe overall UCL history.

The chart is primarily useful for showing when titles accumulated over time.

Recommended UI:

- select one club, or
- compare a small number of clubs;
- allow the user to hide/show series;
- keep the chart readable.

---

# 17. Prime vs longevity scatter plot

Create an analytical scatter plot.

Possible version A:

- X = number of QF+ seasons;
- Y = number of titles.

Possible version B:

- X = number of QF+ seasons;
- Y = number of final appearances.

Each point = one club.

Clicking a point should select that club throughout the interface.

This chart must be described as a relationship between two historical counts, not as a ranking.

Do not draw a trendline unless it is genuinely useful and properly described.

---

# 18. Performance volatility

Use a descriptive visualization of season-to-season stage movement.

Examples:

```text
QF → SF → QF → SF → Final
```

versus

```text
Winner → Group → R16 → Final → Group
```

A possible volatility measure can be derived from **changes in normalized stage categories**, but do not present the result as an inherently meaningful football “quality” score.

Prefer a visual path showing the movement directly.

If a numeric volatility measure is implemented, document the exact formula and label it clearly as an analytical index created for this project.

---

# 19. Season explorer

Add a season selector:

```text
Season: 2011/12 ▼
```

Show all 13 selected clubs for that season.

Example:

```text
2011/12

Chelsea             Winner
Barcelona           Semi-final
Real Madrid         Semi-final
Bayern Munich       Runner-up
...
```

Sort by stage, but do not describe the ordering as an overall ranking.

Clicking a club opens its club history around that season.

---

# 20. Club comparison

Allow selection of 2–5 clubs.

Primary comparison view:

- aligned UCL Journey timelines;
- common season axis;
- shared stage scale;
- matching tooltips;
- synchronized season selection.

Additional cards:

```text
QF+ seasons
Final appearances
Titles
Longest QF+ streak
Strongest 5-season window
```

These are descriptive historical statistics.

Do not automatically rank the clubs from “best” to “worst”.

Let users compare the values directly.

---

# 21. Format-transition visualization

Mark the major competition-format transition around the 2024/25 season.

Use a subtle vertical divider and an annotation:

```text
1996 ─────────────────────── 2024 ┃ 2025 ── 2026
                                  ↑
                             New format
```

Do not use the format-change marker to imply that results before and after it are directly equivalent in every respect.

The site should explain that early-phase labels are not perfectly interchangeable historically.

---

# 22. Match-path details for deep runs

For semifinalists/finalists, provide optional deeper detail.

Example:

```text
2011/12 — Chelsea

R16       Napoli
QF        Benfica
SF        Barcelona
Final     Bayern Munich

Winner
```

This can be displayed in a side drawer/modal.

The match-path data should be source-backed.

Do not reconstruct a knockout path from memory.

---

# 23. Recommended website structure

Use a small number of meaningful pages or tabs rather than one giant dashboard.

Recommended top-level navigation:

### 1. Journey

Primary season-by-season timeline.

### 2. Prime

Peak, prime windows, deep-run density, streaks.

### 3. Compare

Multiple-club aligned visualization.

### 4. Trends

Deep runs, finals, titles, scatter plots and other derived trends.

### 5. Seasons

Season browser for 1995/96–2025/26.

Optionally add an “About / Data” drawer rather than another full page.

---

# 24. Homepage composition

The homepage should be visually simple.

Recommended hierarchy:

```text
UEFA CHAMPIONS LEAGUE HISTORY
1995/96 — 2025/26

Select club
[ Chelsea ▼ ]

UCL JOURNEY
[main timeline]

Peak season        Strongest prime
2011/12             2009–2013

Deep runs           Finals            Titles
  XX                  XX                XX

[Explore Prime]   [Compare Clubs]
```

Do not put ten graphs above the fold.

The main journey is the hero visualization.

---

# 25. Visual design

Target aesthetic:

- premium sports-data editorial;
- dark-first interface;
- minimal and restrained;
- strong typographic hierarchy;
- subtle grid lines;
- compact but legible chart labels;
- high-quality empty states;
- no excessive gradients;
- no unnecessary glassmorphism;
- no giant card stacks;
- no generic SaaS dashboard appearance.

The screenshot/style direction supplied by the user suggests a dark UI is appropriate.

Use color primarily to encode competition stage and selection state, not as decoration.

Avoid using club colors as the default stage encoding because 13 club colors become confusing. Club colors can be used as an optional identity accent in comparison mode.

Include a consistent stage legend.

---

# 26. Responsive/mobile requirements

The site must work well on:

- desktop/laptop;
- tablet;
- iPhone-sized screens.

On narrow screens:

- the chart may use horizontal scrolling inside the chart area;
- controls should stack;
- tooltips should become tap panels/sheets;
- labels must not overlap;
- no page-level horizontal overflow;
- touch targets should be large enough to tap reliably.

Never make hover the only way to access information.

---

# 27. Accessibility

Implement:

- semantic buttons and selects;
- visible keyboard focus;
- accessible labels for filters;
- keyboard navigation where practical;
- text alternatives for chart information;
- sufficient contrast;
- stage information not conveyed only through color;
- `aria-live` for important dynamic selections;
- reduced-motion support.

For SVG charts, include a concise accessible description and allow a tabular/data view for users who need exact values.

---

# 28. Technology recommendation

Recommended stack:

- React
- TypeScript
- Vite
- Tailwind CSS
- D3.js for custom SVG/data visualization

Use React for:

- application state;
- filters;
- navigation;
- tooltips/panels;
- data selection.

Use D3 for:

- scales;
- axes;
- SVG geometry;
- line/path construction;
- heatmap positioning;
- custom chart layout.

Do not create the entire UI imperatively with D3.

Do not add a backend unless it becomes necessary.

The first version should be a static, reproducible frontend backed by local JSON.

---

# 29. Suggested repository structure

```text
ucl-history/
├── public/
│   ├── favicon.svg
│   └── assets/
│
├── src/
│   ├── components/
│   │   ├── AppShell.tsx
│   │   ├── Header.tsx
│   │   ├── ClubSelector.tsx
│   │   ├── SeasonSelector.tsx
│   │   ├── StageLegend.tsx
│   │   ├── UclJourney.tsx
│   │   ├── UclHeatmap.tsx
│   │   ├── PrimePanel.tsx
│   │   ├── PrimeTimeline.tsx
│   │   ├── FinalsTimeline.tsx
│   │   ├── StreakChart.tsx
│   │   ├── DeepRunChart.tsx
│   │   ├── TitleTimeline.tsx
│   │   ├── ComparisonView.tsx
│   │   ├── SeasonExplorer.tsx
│   │   ├── MatchPathPanel.tsx
│   │   └── DataSources.tsx
│   │
│   ├── data/
│   │   ├── clubs.json
│   │   ├── seasons.json
│   │   ├── uclResults.json
│   │   └── knockoutPaths.json
│   │
│   ├── lib/
│   │   ├── stages.ts
│   │   ├── normalize.ts
│   │   ├── analytics.ts
│   │   └── validation.ts
│   │
│   ├── types/
│   │   └── ucl.ts
│   │
│   ├── pages/
│   │   ├── JourneyPage.tsx
│   │   ├── PrimePage.tsx
│   │   ├── ComparePage.tsx
│   │   ├── TrendsPage.tsx
│   │   └── SeasonsPage.tsx
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── scripts/
│   ├── buildDataset.ts
│   ├── validateDataset.ts
│   └── normalizeTeams.ts
│
├── data-source-notes/
│   ├── README.md
│   └── verification-log.csv
│
├── package.json
├── README.md
└── tsconfig.json
```

---

# 30. Data validation

Create a validation script that runs before the website build.

Validation rules:

## Dataset completeness

- exactly 13 canonical teams;
- exactly 31 seasons;
- exactly 403 club-season records;
- exactly one record per `(teamId, seasonEndYear)`;
- no duplicate IDs;
- no missing required fields.

## Stage validity

Every `normalizedStage` must belong to the allowed set.

## Logical consistency

Examples:

```text
winner → reachedFinal = true
winner → won = true
runner_up → reachedFinal = true
runner_up → won = false
semi_final → reachedSemiFinal = true
quarter_final → reachedQuarterFinal = true
round_of_16 → reachedRoundOf16 = true
```

A winner must not be recorded as `participated = false`.

A non-participant must not have a final opponent.

## Season mapping

Check:

```text
1995/96 → 1996
1999/2000 → 2000
2025/26 → 2026
```

Check that axis labels preserve leading zeroes.

## Source validation

All participating records should have at least one source reference.

All deep runs should have UEFA verification where practical.

## Null/number validation

The frontend must never render:

- `NaN`;
- `Infinity`;
- `undefined`;
- blank metrics caused by missing data.

Use explicit “No data” or “Did not participate” where appropriate.

---

# 31. Verification log

Maintain a CSV or JSON log such as:

```csv
season,team,field,status,primarySource,verificationSource,note
2012/13,Chelsea,stage,verified,RSSSF,UEFA,
...
```

Possible status values:

- `verified`
- `cross_checked`
- `needs_review`
- `resolved`

For any disagreement:

```text
RSSSF: Semi-final
UEFA: Semi-final
Status: verified
```

or:

```text
Source A: Quarter-final
Source B: Semi-final
Status: resolved
Resolution: UEFA official competition history confirms semifinal
```

Do not silently overwrite conflicting data.

---

# 32. Data-source UX

Add a small “Data & Sources” section.

Explain:

- the dataset covers 1995/96–2025/26;
- RSSSF is used extensively as the historical reference;
- UEFA is used as the official verification source;
- modern-format seasons are handled separately where necessary;
- raw source URLs are preserved in the dataset metadata;
- derived metrics are calculated from the verified season records.

A user should be able to answer:

> “Where did this Chelsea 2012 result come from?”

without inspecting the source code.

---

# 33. Source-link behavior

A season detail panel should contain:

```text
Sources

UEFA — official season/history page
RSSSF — historical results page
```

Open source links in a new tab.

Do not embed source websites inside iframes.

Do not scrape a page at runtime merely because a user opened a tooltip.

---

# 34. Prime-panel UX

For a selected club:

```text
CHELSEA

Peak season
2011/12 · Winner

Strongest 5-season period
2008/09 → 2012/13

QF+     4 / 5
SF+     3 / 5
Finals  1
Titles  1

Longest QF+ streak
4 seasons

[See prime on timeline]
```

Avoid wording such as:

- “greatest club”;
- “best club”;
- “dominant by our score”;

unless the site is explicitly presenting a user-selectable quantitative metric and clearly labels it as a project-defined measure.

The purpose is to expose historical patterns rather than declare an overall winner among clubs.

---

# 35. Important analytical distinction: participation vs performance

Keep these concepts separate.

A club can fail to qualify for the UCL in a given season.

A club can participate and exit in qualifying.

A club can reach the league/group phase and then exit.

Therefore, calculate at least:

### Participation rate

```text
UCL participations / 31 seasons
```

### QF+ rate among participations

```text
QF+ seasons / UCL participation seasons
```

### QF+ rate over the entire period

```text
QF+ seasons / 31 seasons
```

These answer different questions and should not be conflated.

---

# 36. Recommended derived metrics

For each club, compute:

```text
participationSeasons
qualifyingAppearances
leagueOrGroupAppearances
roundOf16Appearances
quarterFinalAppearances
semiFinalAppearances
finalAppearances
titles
qfPlusSeasons
sfPlusSeasons
longestR16PlusStreak
longestQfPlusStreak
longestSfPlusStreak
longestFinalStreak
peakSeasons
primeWindows
```

Optionally:

```text
averageExitStageAmongParticipations
medianExitStageAmongParticipations
recentQfPlusCount_5yr
recentFinalCount_5yr
recentTitleCount_5yr
```

Do not overemphasize averages because stage levels are ordinal.

Median and frequency counts are easier to defend than arbitrary weighted averages.

---

# 37. Optional “recent form” lens

Add a range selector for:

- full history;
- last 5 seasons;
- last 10 seasons;
- custom range.

This should change the same visualizations rather than create a new analysis framework.

Example:

```text
Range
[1996 — 2026]

or

[2016 — 2026]
```

For a custom range, explicitly show the selected seasons.

---

# 38. Optional era presets

Add preset ranges such as:

- 1996–2000
- 2001–2005
- 2006–2010
- 2011–2015
- 2016–2020
- 2021–2026

These are UI conveniences, not claims that football history naturally breaks into these exact eras.

Avoid wording like “official era”.

---

# 39. Club colors and identity

Use a neutral stage palette globally.

When a club is selected, its crest/name can use a subtle identity accent.

When comparing several clubs, each club may receive a consistent series color.

Requirements:

- colors must remain readable in dark mode;
- color cannot be the only encoded distinction;
- selected state should also use stroke/weight/label treatment;
- legend must identify each series.

Use licensed or appropriately sourced assets for crests/logos. Do not package unlicensed image collections into the project without checking usage rights.

A text-based identity fallback should exist if an image asset is unavailable.

---

# 40. Performance requirements

The core dataset is tiny, so the site should feel instant.

Requirements:

- load the main JSON locally;
- no external data API required for the first paint;
- memoize derived calculations;
- avoid rerendering all charts when only one tooltip changes;
- use SVG for this dataset unless a benchmark shows another renderer is clearly better;
- keep charts responsive;
- no unnecessary animation.

Since there are only 403 core records, optimize for code clarity rather than premature performance tricks.

---

# 41. Animation

Use subtle animations only for:

- switching selected club;
- moving a timeline range;
- opening a season panel;
- transitioning between comparison sets.

Do not animate every data point continuously.

Support `prefers-reduced-motion: reduce`.

---

# 42. Error states

The app should gracefully handle:

- missing dataset file;
- malformed JSON;
- unknown stage;
- missing source link;
- unexpected null;
- a team with no participating seasons;
- chart container resizing.

Show a useful developer-facing error in development and a concise user-facing message in production.

---

# 43. URL state / shareability

Prefer URL query parameters for the main user selection state.

Example:

```text
/journey?team=chelsea
/compare?teams=chelsea,liverpool,bayern
/seasons?season=2012
/prime?team=barcelona
```

This lets users share a specific historical view.

Do not require a backend to support this.

---

# 44. Suggested interaction details

## Club selector

Searchable select or compact dropdown.

## Season selector

Slider or select with full season labels in the expanded UI.

## Range control

Two-ended range slider or two selects.

## Stage filter

Checkbox/chip list.

## Compare mode

Multi-select up to 5 clubs.

## Data view

Provide an optional “Table” button so users can inspect exact rows underlying the chart.

---

# 45. Exact table view

Include a compact table for verification.

Columns:

```text
Club | Season | Stage | Exact Stage | Participated | Final | Winner | Sources
```

Allow sorting by:

- season;
- club;
- stage.

Do not hide data behind the chart.

This table also helps debug the visualization.

---

# 46. Export features

Optional but valuable:

- download current filtered data as CSV;
- copy/share current view URL;
- export a chart image if simple and stable.

Do not implement export before the core data and visualizations are correct.

---

# 47. Testing

Implement tests for:

## Data tests

```text
403 records
31 seasons
13 teams
no duplicates
valid stages
```

## Analytics tests

Test known synthetic sequences for:

- peak season;
- 5-year prime detection;
- QF+ streak;
- final streak;
- cumulative titles.

Example synthetic input:

```text
QF, SF, SF, Winner, QF
```

Expected:

```text
QF+ = 5
SF+ = 3
Finals = 1
Titles = 1
```

## UI tests

Verify:

- club selector updates all visualizations;
- season selection opens the correct panel;
- compare mode supports 2–5 clubs;
- mobile layout does not overflow;
- tooltips work on tap;
- source links open correctly.

---

# 48. Implementation order

Do not build every chart immediately.

Follow this order:

### Phase 1 — data

1. Build season list.
2. Build canonical club list.
3. Acquire RSSSF/UEFA source data.
4. Normalize names.
5. Normalize stages.
6. Create 403 records.
7. Validate.
8. Manually review conflicts.

### Phase 2 — foundation

9. Create React/Vite/TypeScript app.
10. Create types.
11. Load local JSON.
12. Create shared stage metadata.
13. Create filter state.

### Phase 3 — primary visualization

14. Build UCL Journey.
15. Add tooltips.
16. Add season detail panel.
17. Add source links.
18. Make it mobile-friendly.

### Phase 4 — analysis

19. Build heatmap.
20. Build prime calculations.
21. Build Prime page.
22. Build streaks.
23. Build finals timeline.
24. Build title accumulation.
25. Build scatter plots.

### Phase 5 — exploration

26. Build compare mode.
27. Build season explorer.
28. Add match-path details.
29. Add URL state.
30. Add optional CSV export.

### Phase 6 — polish

31. Add responsive refinements.
32. Add accessibility.
33. Add source/data documentation.
34. Add validation to build process.
35. Test all 403 records.
36. Final visual QA.

---

# 49. What NOT to do

Do not:

- fabricate missing results;
- use memory for historical UCL stage data;
- use Wikipedia as the only data source;
- scrape live websites from the browser at runtime;
- silently resolve source conflicts;
- collapse all historical early rounds into one stage in the raw data;
- call the 2024/25+ league phase “group stage”;
- calculate a fake average stage and call it objective quality;
- rank the clubs by a homemade “greatness score”;
- build a dashboard with ten charts on one screen;
- use huge animations;
- rely on hover for mobile functionality;
- use arbitrary club colors for the entire stage system;
- leave missing club-season records as null without explanation.

---

# 50. Analytical language guidelines

Use precise language.

Good:

> “Chelsea reached the quarter-final in 4 of the selected 5 seasons.”

Good:

> “The strongest 5-season window contains five QF+ appearances, including three semifinal-or-better runs.”

Avoid:

> “Our algorithm proves this was Chelsea’s greatest era.”

The prime detector identifies periods satisfying explicit historical criteria. It does not discover an objective truth about which club or era was “greatest”.

---

# 51. Recommended first-version charts

The first public version should ship with exactly these core visualizations:

1. **UCL Journey timeline** — primary.
2. **13-club heatmap** — global overview.
3. **Prime window timeline** — rolling 5-season prime detection.
4. **QF+ / deep-run frequency** — historical frequency.
5. **Finals timeline** — finals and titles.
6. **Longest streaks** — sustained presence.
7. **Cumulative titles** — trophy accumulation.
8. **Prime vs longevity scatter** — analytical comparison.
9. **Club comparison timeline** — selected clubs.
10. **Season explorer** — single-season view.

Everything else is optional until these work well.

---

# 52. Example JSON record

Example only; do not copy historical values from this example without verifying the underlying source.

```json
{
  "teamId": "chelsea",
  "teamName": "Chelsea",
  "seasonLabel": "2011/12",
  "seasonEndYear": 2012,
  "axisLabel": "12",
  "participated": true,
  "entryStage": "Group Stage",
  "normalizedStage": "winner",
  "exactStage": "Winner",
  "reachedRoundOf16": true,
  "reachedQuarterFinal": true,
  "reachedSemiFinal": true,
  "reachedFinal": true,
  "won": true,
  "leaguePhasePosition": null,
  "groupPosition": 2,
  "finalOpponent": "Bayern Munich",
  "finalResult": "Won on penalties",
  "sources": [
    {
      "provider": "UEFA",
      "url": "...",
      "role": "official_verification"
    },
    {
      "provider": "RSSSF",
      "url": "...",
      "role": "historical_reference"
    }
  ]
}
```

---

# 53. Example analytics API

Keep the analytics pure and testable.

```ts
getClubSeasons(teamId)
getPeakSeasons(teamId)
getPrimeWindows(teamId, windowSize = 5)
getQfPlusCount(teamId, range)
getSfPlusCount(teamId, range)
getFinalCount(teamId, range)
getTitleCount(teamId, range)
getLongestStreak(teamId, predicate)
getCumulativeTitles(teamId)
compareClubs(teamIds, range)
getSeasonSnapshot(seasonEndYear)
```

No React state inside these functions.

No DOM operations inside these functions.

---

# 54. Prime-window algorithm pseudocode

```ts
function getPrimeWindows(records: ClubSeasonRecord[], windowSize = 5) {
  const sorted = [...records].sort(
    (a, b) => a.seasonEndYear - b.seasonEndYear
  );

  const windows = [];

  for (let i = 0; i <= sorted.length - windowSize; i++) {
    const window = sorted.slice(i, i + windowSize);

    const qfPlus = window.filter(r => r.reachedQuarterFinal).length;
    const sfPlus = window.filter(r => r.reachedSemiFinal).length;
    const finals = window.filter(r => r.reachedFinal).length;
    const titles = window.filter(r => r.won).length;

    windows.push({
      start: window[0].seasonEndYear,
      end: window[window.length - 1].seasonEndYear,
      qfPlus,
      sfPlus,
      finals,
      titles
    });
  }

  return windows.sort((a, b) =>
    b.qfPlus - a.qfPlus ||
    b.sfPlus - a.sfPlus ||
    b.finals - a.finals ||
    b.titles - a.titles
  );
}
```

Important implementation note:

The actual production function should preserve all tied windows rather than arbitrarily returning only the first row.

Also consider whether a window should require a minimum number of UCL participations before describing it as a prime. Document that decision in the UI. A simple approach is to calculate the metrics over all five seasons but show participation counts as additional context.

---

# 55. Data interpretation edge cases

Handle these explicitly:

## Team absent from UCL

```text
participated = false
normalizedStage = did_not_participate
```

## Team loses qualifying

```text
participated = true
normalizedStage = qualifying
```

## Team exits older group phase

```text
participated = true
normalizedStage = group_phase
exactStage = source-specific historical label
```

## Team exits modern league phase

```text
participated = true
normalizedStage = league_phase
```

## Team exits modern knockout play-off

```text
participated = true
normalizedStage = knockout_playoff
```

## Team reaches round of 16

```text
reachedRoundOf16 = true
```

## Team reaches semi-final

```text
reachedRoundOf16 = true
reachedQuarterFinal = true
reachedSemiFinal = true
reachedFinal = false
won = false
```

## Runner-up

```text
reachedRoundOf16 = true
reachedQuarterFinal = true
reachedSemiFinal = true
reachedFinal = true
won = false
normalizedStage = runner_up
```

## Winner

```text
reachedFinal = true
won = true
normalizedStage = winner
```

---

# 56. Historical comparison cautions

The website is about a long historical interval containing changes in:

- tournament structure;
- number of participating teams;
- number of matches;
- qualification routes;
- group/league formats;
- knockout entry points.

Therefore:

- be comfortable comparing deep knockout rounds;
- be cautious when comparing group-stage performance across decades;
- make early-stage normalization transparent;
- use exact source labels in the detail panel;
- visually mark the modern league-phase era.

The site should prefer **descriptive historical visualization** over claims of strict apples-to-apples equivalence.

---

# 57. Final quality bar

The project is finished only when all of the following are true:

### Data

- 403 club-season records exist.
- Every record has a normalized stage.
- Every participating record has source metadata.
- Major results are cross-checked against UEFA.
- 2025/26 is verified from a current official source.
- Conflicting records have been reviewed.

### Visualization

- Journey timeline works.
- Heatmap works.
- Prime analysis works.
- Comparison works.
- Season explorer works.
- Tooltips work on desktop and mobile.
- Full season labels are available on demand.
- X-axis uses compact ending-year labels.

### UX

- No page-level horizontal overflow.
- Responsive on mobile.
- Keyboard accessible.
- No hover-only functionality.
- Dark theme is polished.
- Charts are readable without excessive decoration.

### Engineering

- TypeScript is used throughout.
- Analytics are pure/testable functions.
- Data validation runs before build.
- No runtime dependence on scraping external websites.
- No hard-coded analytics scattered throughout components.
- No fabricated or guessed historical values.

---

# 58. MASTER PROMPT FOR THE CODING AGENT

Use the following prompt when asking an AI coding agent to build the project.

---

You are building a production-quality React + TypeScript + Vite website called **UCL History**.

The website visualizes UEFA Champions League history for exactly 13 clubs from the 1995/96 season through the completed 2025/26 season.

## Clubs

- Chelsea
- Juventus
- AC Milan
- Inter
- Liverpool
- Bayern Munich
- Manchester United
- Manchester City
- Real Madrid
- Barcelona
- Atlético de Madrid
- Borussia Dortmund
- Paris Saint-Germain

## Season convention

Use the ending year internally:

1995/96 → 1996
1996/97 → 1997
...
2025/26 → 2026

Use the compact x-axis labels:

96, 97, 98, 99, 00, 01 ... 26

The full season must always be available in tooltips/detail views.

## Data requirement

Build a complete 13 × 31 dataset = 403 club-season observations.

Do not only store seasons in which clubs participated. Explicitly represent seasons in which a club did not participate.

Use RSSSF as a major historical reference source and UEFA as the official verification source. Verify all major deep runs and all potentially ambiguous records. Use UEFA particularly for modern-format seasons and 2025/26.

Do not guess data from memory. Do not fabricate missing values. Do not silently resolve conflicting sources.

Store source URLs with records or in a verification log.

Build a local, static JSON dataset. Do not scrape external websites in the browser at runtime.

## Stage normalization

Preserve both:

- `exactStage` — source-specific historical stage name;
- `normalizedStage` — stable application category.

Use normalized categories:

- did_not_participate
- qualifying
- group_phase
- league_phase
- knockout_playoff
- round_of_16
- quarter_final
- semi_final
- runner_up
- winner

Do not label the new 2024/25+ league phase as a group stage.

Preserve unusual historical stages in `exactStage`.

## Core page

Create a **UCL Journey** page.

Primary chart:

- x-axis = season ending year;
- y-axis = normalized stage;
- one selected club at a time by default;
- season point/cell for every season;
- full tooltips;
- click a season to open a detail panel.

The chart should feel editorial, premium, dark, minimal and sports-focused.

Do not make it look like a generic SaaS dashboard.

## Heatmap

Build a 13 × 31 heatmap where rows are clubs and columns are seasons.

Every cell must exist.

Use color to encode stage, with text/tooltip support so color is never the only information channel.

## Prime analysis

Do not invent a vague “greatest era” score.

Calculate:

1. peak season;
2. rolling 5-season prime windows;
3. QF+ season count per window;
4. SF+ season count per window;
5. final count per window;
6. title count per window;
7. longest QF+ streak;
8. longest SF+ streak;
9. longest final streak.

Define the default 5-season prime window by lexicographic criteria:

1. maximum QF+ count;
2. then SF+ count;
3. then finals;
4. then titles;
5. preserve ties if necessary.

Display the ingredients of the prime window, not merely a single score.

Example:

“Strongest 5-season period: 2009–2013 — QF+ 5/5, SF+ 3/5, finals 1, titles 1.”

## Additional charts

Build:

- deep-run frequency;
- finals timeline;
- cumulative titles;
- streak chart;
- prime vs longevity scatter;
- club comparison timeline;
- season explorer.

## Comparison

Allow 2–5 clubs to be selected.

Show aligned timelines.

Do not automatically output an overall “best club” ranking.

Present factual historical counts and trajectories.

## Season explorer

Selecting a season should show all 13 clubs and their exact/normalized results for that year.

Clicking a club opens its journey.

## Deep-run match details

Where verified, add knockout-path information for QF/SF/final runs.

A season detail panel may show:

R16 → opponent
QF → opponent
SF → opponent
Final → opponent

Only use source-backed match-path data.

## Data table

Provide a table view with:

Club | Season | Stage | Exact Stage | Participated | Final | Winner | Sources

This is an important transparency/debugging view.

## Format transition

Visually mark the modern-format transition around 2024/25.

Do not imply that early-phase results across all decades are perfectly comparable.

## Engineering

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- D3.js

Use React for application state/UI and D3 for custom visualization geometry/scales.

Keep analytics in pure functions.

Create a dataset validation script.

Validation must fail if:

- there are not exactly 403 records;
- duplicate team-season pairs exist;
- an invalid stage exists;
- required fields are missing;
- logical flags contradict normalizedStage.

## Responsive behavior

Must work on desktop and phone.

On mobile:

- charts may scroll horizontally within their local container;
- no page-level horizontal overflow;
- filters stack vertically;
- tooltips become tap-friendly panels;
- hover cannot be the only way to access data.

## Accessibility

Use semantic controls, keyboard focus, readable contrast, reduced motion and non-color stage cues.

## Data provenance

Every deep-run record should be traceable to source metadata.

Add a Data & Sources section that explains:

- RSSSF historical reference;
- UEFA official verification;
- modern-format handling;
- derived analytics methodology.

## Important constraints

Do not:

- invent historical results;
- use Wikipedia as the only source;
- scrape websites at runtime;
- silently resolve source conflicts;
- call a homemade stage average an objective UCL performance score;
- build a giant dashboard with every chart on one screen;
- make hover the only interaction;
- use club colors as the only encoding mechanism.

## Build order

First build and validate the dataset.

Then build the Journey timeline.

Then build the heatmap.

Then build Prime analytics.

Then build comparison and season explorer.

Then add the optional match-path enrichment.

Finally perform visual/accessibility/data QA.

Do not start polishing ten charts before the underlying 403-row dataset is verified.

## Final deliverable

The finished product should feel like a polished interactive historical football visualization with trustworthy data provenance, a clear season-by-season journey, meaningful prime-period analysis, and enough exploration depth to make users want to browse different clubs and eras.

The central principle is:

> **Historical result → transparent visualization → transparent derived analysis.**

Never reverse that order.

---

# 59. Source references

Primary references for implementation and verification:

RSSSF European Cups Archive:
`https://www.rsssf.org/ec/`

RSSSF 1995/96 European Competitions:
`https://www.rsssf.org/ec/ec199596.html`

RSSSF 1996/97 European Competitions:
`https://www.rsssf.org/ec/ec199697.html`

UEFA Champions League history:
`https://www.uefa.com/uefachampionsleague/history/`

UEFA Champions League competition format:
`https://www.uefa.com/uefachampionsleague/competition-format/`

UEFA 2024/25 format explanation:
`https://www.uefa.com/uefachampionsleague/news/0290-1bae124dbd1a-4a9fc08cd25c-1000/`

UEFA 2025/26 results:
`https://www.uefa.com/uefachampionsleague/news/029c-1e9a2f63fe2d-ebf9ad643892-1000/`

---

# 60. Short project vision

This should not end up as “a graph of who won the Champions League”.

It should answer richer historical questions:

- When did a club enter a sustained elite period?
- How often did it reach the latter stages?
- How long did those runs last?
- Did its prime come from repeated QF/SF appearances or from a concentrated run of titles/finals?
- How did different clubs' trajectories overlap?
- How does a club's UCL history look when reduced to a timeline, heatmap, streak profile and prime window?
- How do these patterns change across the old group-stage era and the modern league-phase era?

The best version of the product makes the answers **visible first**, and lets the user inspect the underlying numbers and sources immediately.
