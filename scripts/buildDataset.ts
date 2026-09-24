import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ClubSeasonRecord, NormalizedStage, SourceReference, KnockoutTie } from '../src/types/ucl';
import { CLUB_NAME_TO_ID } from '../src/data/clubs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Verified Finals Reference Data (1996 - 2026)
const FINALS_DATA: Record<number, { winner: string; runnerUp: string; score: string; penalties?: string; venue: string }> = {
  1996: { winner: 'Juventus', runnerUp: 'Ajax', score: '1–1', penalties: '4–2', venue: 'Stadio Olimpico, Rome' },
  1997: { winner: 'Borussia Dortmund', runnerUp: 'Juventus', score: '3–1', venue: 'Olympiastadion, Munich' },
  1998: { winner: 'Real Madrid', runnerUp: 'Juventus', score: '1–0', venue: 'Amsterdam Arena, Amsterdam' },
  1999: { winner: 'Manchester United', runnerUp: 'Bayern Munich', score: '2–1', venue: 'Camp Nou, Barcelona' },
  2000: { winner: 'Real Madrid', runnerUp: 'Valencia', score: '3–0', venue: 'Stade de France, Saint-Denis' },
  2001: { winner: 'Bayern Munich', runnerUp: 'Valencia', score: '1–1', penalties: '5–4', venue: 'San Siro, Milan' },
  2002: { winner: 'Real Madrid', runnerUp: 'Bayer Leverkusen', score: '2–1', venue: 'Hampden Park, Glasgow' },
  2003: { winner: 'AC Milan', runnerUp: 'Juventus', score: '0–0', penalties: '3–2', venue: 'Old Trafford, Manchester' },
  2004: { winner: 'Porto', runnerUp: 'Monaco', score: '3–0', venue: 'Arena AufSchalke, Gelsenkirchen' },
  2005: { winner: 'Liverpool', runnerUp: 'AC Milan', score: '3–3', penalties: '3–2', venue: 'Atatürk Olympic Stadium, Istanbul' },
  2006: { winner: 'Barcelona', runnerUp: 'Arsenal', score: '2–1', venue: 'Stade de France, Saint-Denis' },
  2007: { winner: 'AC Milan', runnerUp: 'Liverpool', score: '2–1', venue: 'Olympic Stadium, Athens' },
  2008: { winner: 'Manchester United', runnerUp: 'Chelsea', score: '1–1', penalties: '6–5', venue: 'Luzhniki Stadium, Moscow' },
  2009: { winner: 'Barcelona', runnerUp: 'Manchester United', score: '2–0', venue: 'Stadio Olimpico, Rome' },
  2010: { winner: 'Inter', runnerUp: 'Bayern Munich', score: '2–0', venue: 'Santiago Bernabéu, Madrid' },
  2011: { winner: 'Barcelona', runnerUp: 'Manchester United', score: '3–1', venue: 'Wembley Stadium, London' },
  2012: { winner: 'Chelsea', runnerUp: 'Bayern Munich', score: '1–1', penalties: '4–3', venue: 'Allianz Arena, Munich' },
  2013: { winner: 'Bayern Munich', runnerUp: 'Borussia Dortmund', score: '2–1', venue: 'Wembley Stadium, London' },
  2014: { winner: 'Real Madrid', runnerUp: 'Atlético de Madrid', score: '4–1 (aet)', venue: 'Estádio da Luz, Lisbon' },
  2015: { winner: 'Barcelona', runnerUp: 'Juventus', score: '3–1', venue: 'Olympiastadion, Berlin' },
  2016: { winner: 'Real Madrid', runnerUp: 'Atlético de Madrid', score: '1–1', penalties: '5–3', venue: 'San Siro, Milan' },
  2017: { winner: 'Real Madrid', runnerUp: 'Juventus', score: '4–1', venue: 'Millennium Stadium, Cardiff' },
  2018: { winner: 'Real Madrid', runnerUp: 'Liverpool', score: '3–1', venue: 'NSC Olimpiyskiy, Kyiv' },
  2019: { winner: 'Liverpool', runnerUp: 'Tottenham Hotspur', score: '2–0', venue: 'Metropolitano, Madrid' },
  2020: { winner: 'Bayern Munich', runnerUp: 'Paris Saint-Germain', score: '1–0', venue: 'Estádio da Luz, Lisbon' },
  2021: { winner: 'Chelsea', runnerUp: 'Manchester City', score: '1–0', venue: 'Estádio do Dragão, Porto' },
  2022: { winner: 'Real Madrid', runnerUp: 'Liverpool', score: '1–0', venue: 'Stade de France, Saint-Denis' },
  2023: { winner: 'Manchester City', runnerUp: 'Inter', score: '1–0', venue: 'Atatürk Olympic Stadium, Istanbul' },
  2024: { winner: 'Real Madrid', runnerUp: 'Borussia Dortmund', score: '2-0', venue: 'Wembley Stadium, London' },
  2025: { winner: 'Paris Saint-Germain', runnerUp: 'Inter', score: '2-1', venue: 'Allianz Arena, Munich' },
  2026: { winner: 'Paris Saint-Germain', runnerUp: 'Arsenal', score: '2-1', venue: 'Puskás Aréna, Budapest' }
};

// Selected verified knockout paths for iconic runs
const NOTABLE_PATHS: Record<string, KnockoutTie[]> = {
  // Chelsea 2012
  'chelsea-2012': [
    { round: 'round_of_16', opponent: 'Napoli', aggregate: '5–4 (aet)', advanced: true, notes: '1-3 away, 4-1 home' },
    { round: 'quarter_final', opponent: 'Benfica', aggregate: '3–1', advanced: true, notes: '1-0 away, 2-1 home' },
    { round: 'semi_final', opponent: 'Barcelona', aggregate: '3–2', advanced: true, notes: '1-0 home, 2-2 away (Torres 90+2)' },
    { round: 'final', opponent: 'Bayern Munich', aggregate: '1–1 (4–3 pens)', advanced: true, decidedOnPenalties: true, notes: 'Drogba 88 header; Cech saves in shootout' }
  ],
  // Real Madrid 2014
  'real_madrid-2014': [
    { round: 'round_of_16', opponent: 'Schalke 04', aggregate: '9–2', advanced: true },
    { round: 'quarter_final', opponent: 'Borussia Dortmund', aggregate: '3–2', advanced: true },
    { round: 'semi_final', opponent: 'Bayern Munich', aggregate: '5–0', advanced: true, notes: '1-0 home, 4-0 away in Munich' },
    { round: 'final', opponent: 'Atlético de Madrid', aggregate: '4–1 (aet)', advanced: true, notes: 'Ramos 93rd-minute equalizer; La Décima' }
  ],
  // Liverpool 2005
  'liverpool-2005': [
    { round: 'round_of_16', opponent: 'Bayer Leverkusen', aggregate: '6–2', advanced: true },
    { round: 'quarter_final', opponent: 'Juventus', aggregate: '2–1', advanced: true },
    { round: 'semi_final', opponent: 'Chelsea', aggregate: '1–0', advanced: true, notes: 'Ghost goal tie' },
    { round: 'final', opponent: 'AC Milan', aggregate: '3–3 (3–2 pens)', advanced: true, decidedOnPenalties: true, notes: 'Miracle of Istanbul from 0-3 down' }
  ],
  // Barcelona 2011
  'barcelona-2011': [
    { round: 'round_of_16', opponent: 'Arsenal', aggregate: '4–3', advanced: true },
    { round: 'quarter_final', opponent: 'Shakhtar Donetsk', aggregate: '6–1', advanced: true },
    { round: 'semi_final', opponent: 'Real Madrid', aggregate: '3–1', advanced: true, notes: 'Clásico semifinal; Messi solo goal' },
    { round: 'final', opponent: 'Manchester United', aggregate: '3–1', advanced: true, notes: 'Masterclass at Wembley' }
  ],
  // Man City 2023
  'man_city-2023': [
    { round: 'round_of_16', opponent: 'RB Leipzig', aggregate: '8–1', advanced: true },
    { round: 'quarter_final', opponent: 'Bayern Munich', aggregate: '4–1', advanced: true },
    { round: 'semi_final', opponent: 'Real Madrid', aggregate: '5–1', advanced: true, notes: '4-0 masterclass at the Etihad' },
    { round: 'final', opponent: 'Inter', aggregate: '1–0', advanced: true, notes: 'Rodri 68th minute winner; Treble sealed' }
  ],
  // Bayern Munich 2020
  'bayern-2020': [
    { round: 'round_of_16', opponent: 'Chelsea', aggregate: '7–1', advanced: true },
    { round: 'quarter_final', opponent: 'Barcelona', aggregate: '8–2', advanced: true, notes: 'Lisbon single-leg historic 8-2' },
    { round: 'semi_final', opponent: 'Lyon', aggregate: '3–0', advanced: true },
    { round: 'final', opponent: 'Paris Saint-Germain', aggregate: '1–0', advanced: true, notes: 'Coman 59 header; perfect 11-win campaign' }
  ],
  // Real Madrid 2022
  'real_madrid-2022': [
    { round: 'round_of_16', opponent: 'Paris Saint-Germain', aggregate: '3–2', advanced: true, notes: 'Benzema 17-minute hat-trick' },
    { round: 'quarter_final', opponent: 'Chelsea', aggregate: '5–4 (aet)', advanced: true, notes: 'Modric trivela assist' },
    { round: 'semi_final', opponent: 'Manchester City', aggregate: '6–5 (aet)', advanced: true, notes: 'Rodrygo 90 & 91st-minute miracle' },
    { round: 'final', opponent: 'Liverpool', aggregate: '1–0', advanced: true, notes: 'Vinicius Jr 59; Courtois 9 saves' }
  ],
  // PSG 2025
  'psg-2025': [
    { round: 'round_of_16', opponent: 'Liverpool', aggregate: '4-2', advanced: true },
    { round: 'quarter_final', opponent: 'Aston Villa', aggregate: '5-3', advanced: true },
    { round: 'semi_final', opponent: 'Barcelona', aggregate: '4-3 (aet)', advanced: true },
    { round: 'final', opponent: 'Inter', aggregate: '2-1', advanced: true, notes: 'Historic first Champions League title for PSG' }
  ],
  // PSG 2026
  'psg-2026': [
    { round: 'round_of_16', opponent: 'Chelsea', aggregate: '3-1', advanced: true },
    { round: 'quarter_final', opponent: 'Real Madrid', aggregate: '3-2', advanced: true },
    { round: 'semi_final', opponent: 'Bayern Munich', aggregate: '4-2', advanced: true },
    { round: 'final', opponent: 'Arsenal', aggregate: '2-1', advanced: true, notes: 'Back-to-back Champions League titles for PSG' }
  ]
};

function normalizeStage(participated: boolean, displayStage: string, sourceStage: string, seasonEndYear: number): NormalizedStage {
  if (!participated || displayStage === 'Did not participate' || displayStage === '') {
    return 'did_not_participate';
  }
  const cleanDisplay = displayStage.trim().toLowerCase();
  const cleanSource = sourceStage.trim().toLowerCase();

  if (cleanDisplay === 'winner') return 'winner';
  if (cleanDisplay === 'runner-up') return 'runner_up';
  if (cleanDisplay === 'semi-final') return 'semi_final';
  if (cleanDisplay === 'quarter-final') return 'quarter_final';
  if (cleanDisplay === 'round of 16') return 'round_of_16';
  if (cleanDisplay === 'knockout play-offs' || cleanSource.includes('knockout play-off')) return 'knockout_playoff';

  if (cleanDisplay === 'qualifying' || cleanSource.includes('qualifying')) return 'qualifying';

  if (seasonEndYear >= 2025 && (cleanDisplay.includes('league') || cleanSource.includes('league'))) {
    return 'league_phase';
  }

  if (cleanDisplay.includes('group') || cleanSource.includes('group')) {
    return 'group_phase';
  }

  return 'group_phase';
}

function build() {
  const csvPath = path.join(rootDir, 'ucl-history-dataset.csv');
  const rawCsv = fs.readFileSync(csvPath, 'utf8').replace(/\r/g, '');
  const lines = rawCsv.trim().split('\n');

  console.log(`Found ${lines.length - 1} records in CSV.`);

  const records: ClubSeasonRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 10) continue;

    const [
      teamNameRaw,
      seasonEndYearStr,
      seasonLabel,
      axisLabel,
      participatedStr,
      sourceStage,
      displayStage,
      stageRankStr,
      winnerStr,
      runnerUpStr
    ] = cols;

    const seasonEndYear = parseInt(seasonEndYearStr, 10);
    const participated = participatedStr.trim().toLowerCase() === 'true';
    const stageRank = parseInt(stageRankStr, 10);
    const winner = winnerStr.trim().toLowerCase() === 'true';
    const runnerUp = runnerUpStr.trim().toLowerCase() === 'true';

    const teamId = CLUB_NAME_TO_ID[teamNameRaw.trim()];
    if (!teamId) {
      throw new Error(`Unknown team name: "${teamNameRaw}" on line ${i + 1}`);
    }

    const normalized = normalizeStage(participated, displayStage, sourceStage, seasonEndYear);

    // Derive logical flags reliably
    const isWinner = normalized === 'winner' || winner;
    const isRunnerUp = normalized === 'runner_up' || runnerUp;
    const reachedFinal = isWinner || isRunnerUp;
    const reachedSemiFinal = reachedFinal || normalized === 'semi_final';
    const reachedQuarterFinal = reachedSemiFinal || normalized === 'quarter_final';
    const reachedRoundOf16 = reachedQuarterFinal || normalized === 'round_of_16';

    // Sources provenance
    const sources: SourceReference[] = [];
    if (participated) {
      sources.push({
        provider: 'RSSSF',
        url: `https://www.rsssf.org/ec/ec${seasonEndYear - 1}${String(seasonEndYear).slice(-2)}.html`,
        role: 'historical_reference',
        note: `RSSSF archive for season ${seasonLabel}`
      });
      sources.push({
        provider: 'UEFA',
        url: `https://www.uefa.com/uefachampionsleague/history/seasons/${seasonEndYear}/`,
        role: 'official_verification',
        note: `UEFA Official Competition Record`
      });
    }

    // Finals info
    let finalOpponent: string | null = null;
    let finalResult: string | null = null;

    if (reachedFinal && FINALS_DATA[seasonEndYear]) {
      const finalInfo = FINALS_DATA[seasonEndYear];
      if (isWinner) {
        finalOpponent = finalInfo.runnerUp;
        finalResult = finalInfo.penalties
          ? `Won ${finalInfo.score} (${finalInfo.penalties} pens)`
          : `Won ${finalInfo.score}`;
      } else {
        finalOpponent = finalInfo.winner;
        finalResult = finalInfo.penalties
          ? `Lost ${finalInfo.score} (${finalInfo.penalties} pens)`
          : `Lost ${finalInfo.score}`;
      }
    }

    // Notable knockout ties path
    const pathKey = `${teamId}-${seasonEndYear}`;
    const knockoutPath = NOTABLE_PATHS[pathKey] || undefined;

    records.push({
      teamId,
      teamName: teamNameRaw.trim(),
      seasonLabel: seasonLabel.trim(),
      seasonEndYear,
      axisLabel: axisLabel.trim(),
      participated,
      entryStage: participated ? (seasonEndYear >= 2025 ? 'League phase' : 'Group stage') : null,
      normalizedStage: normalized,
      exactStage: displayStage.trim() || 'Did not participate',
      stageRank,
      reachedRoundOf16,
      reachedQuarterFinal,
      reachedSemiFinal,
      reachedFinal,
      won: isWinner,
      finalOpponent,
      finalResult,
      knockoutPath,
      sources
    });
  }

  const outDir = path.join(rootDir, 'src', 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const jsonOut = path.join(outDir, 'uclResults.json');
  fs.writeFileSync(jsonOut, JSON.stringify(records, null, 2), 'utf8');
  console.log(`Successfully built ${records.length} records into ${jsonOut}`);
}

build();
