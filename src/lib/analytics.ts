import { ClubSeasonRecord, PrimeWindow, StreakInfo, GoldenEra } from '../types/ucl';
import uclResultsRaw from '../data/uclResults.json';

const allRecords: ClubSeasonRecord[] = uclResultsRaw as ClubSeasonRecord[];

/**
 * Filter records for a club within an optional year range [startYear, endYear]
 */
export function getClubSeasons(teamId: string, range?: [number, number]): ClubSeasonRecord[] {
  return allRecords
    .filter(r => r.teamId === teamId)
    .filter(r => (range ? r.seasonEndYear >= range[0] && r.seasonEndYear <= range[1] : true))
    .sort((a, b) => a.seasonEndYear - b.seasonEndYear);
}

/**
 * Returns all records for a specific season across all 13 clubs,
 * sorted by stage rank descending.
 */
export function getSeasonSnapshot(seasonEndYear: number): ClubSeasonRecord[] {
  return allRecords
    .filter(r => r.seasonEndYear === seasonEndYear)
    .sort((a, b) => b.stageRank - a.stageRank);
}

/**
 * Identify a club's peak season(s) - all European finals reached, or deepest stage reached.
 */
export function getPeakSeasons(teamId: string): ClubSeasonRecord[] {
  const seasons = getClubSeasons(teamId).filter(s => s.participated);
  if (seasons.length === 0) return [];

  const finals = seasons.filter(s => s.reachedFinal);
  if (finals.length > 0) return finals;

  const maxRank = Math.max(...seasons.map(s => s.stageRank));
  return seasons.filter(s => s.stageRank === maxRank);
}

/**
 * Calculate rolling prime windows using lexicographic ranking:
 * 1. Maximum QF+ appearances
 * 2. Maximum SF+ appearances
 * 3. Maximum Finals appearances
 * 4. Maximum Titles
 */
export function getPrimeWindows(records: ClubSeasonRecord[], windowSize = 5): PrimeWindow[] {
  const sorted = [...records].sort((a, b) => a.seasonEndYear - b.seasonEndYear);
  const windows: PrimeWindow[] = [];

  if (sorted.length < windowSize) return windows;

  for (let i = 0; i <= sorted.length - windowSize; i++) {
    const slice = sorted.slice(i, i + windowSize);
    const participations = slice.filter(r => r.participated).length;
    const qfPlus = slice.filter(r => r.reachedQuarterFinal).length;
    const sfPlus = slice.filter(r => r.reachedSemiFinal).length;
    const finals = slice.filter(r => r.reachedFinal).length;
    const titles = slice.filter(r => r.won).length;

    windows.push({
      startYear: slice[0].seasonEndYear,
      endYear: slice[slice.length - 1].seasonEndYear,
      startSeason: slice[0].seasonLabel,
      endSeason: slice[slice.length - 1].seasonLabel,
      windowSize,
      participations,
      qfPlus,
      sfPlus,
      finals,
      titles,
      density: qfPlus / windowSize,
      seasons: slice
    });
  }

  // Lexicographic sort
  return windows.sort((a, b) => {
    if (b.qfPlus !== a.qfPlus) return b.qfPlus - a.qfPlus;
    if (b.sfPlus !== a.sfPlus) return b.sfPlus - a.sfPlus;
    if (b.finals !== a.finals) return b.finals - a.finals;
    if (b.titles !== a.titles) return b.titles - a.titles;
    return a.startYear - b.startYear;
  });
}

/**
 * Returns the highest-ranked prime window(s) preserving ties.
 */
export function getBestPrimeWindows(teamId: string, windowSize = 5): PrimeWindow[] {
  const seasons = getClubSeasons(teamId);
  const ranked = getPrimeWindows(seasons, windowSize);
  if (ranked.length === 0) return [];

  const top = ranked[0];
  return ranked.filter(
    w =>
      w.qfPlus === top.qfPlus &&
      w.sfPlus === top.sfPlus &&
      w.finals === top.finals &&
      w.titles === top.titles
  );
}

interface EraDefinition {
  name: string;
  startYear: number;
  endYear: number;
  description: string;
}

const CLUB_GOLDEN_ERAS: Record<string, EraDefinition[]> = {
  barcelona: [
    {
      name: 'The Ronaldinho Prime Era',
      startYear: 2005,
      endYear: 2007,
      description: 'Ronaldinho at his peak capturing the 2005 Ballon d\'Or and leading Barcelona to the 2006 Champions League title in Paris.'
    },
    {
      name: 'The Guardiola & Messi Era',
      startYear: 2009,
      endYear: 2012,
      description: 'Pep Guardiola and Lionel Messi reaching at least the semi-finals every season and winning two Champions League titles.'
    },
    {
      name: 'The Enrique & MSN Era',
      startYear: 2015,
      endYear: 2017,
      description: 'Luis Enrique managing the Messi, Suárez, and Neymar attacking trident to capture the 2015 Treble.'
    }
  ],
  real_madrid: [
    {
      name: 'The Del Bosque & Raúl Era',
      startYear: 1998,
      endYear: 2003,
      description: 'Vicente del Bosque, Fernando Redondo, and Raúl capturing three Champions League titles in five seasons.'
    },
    {
      name: 'The Zidane & Ronaldo Era',
      startYear: 2014,
      endYear: 2018,
      description: 'Zinedine Zidane and Cristiano Ronaldo securing an unprecedented three consecutive European crowns.'
    },
    {
      name: 'The Ancelotti & Vinícius Era',
      startYear: 2022,
      endYear: 2024,
      description: 'Carlo Ancelotti and Vinícius Jr capturing two Champions League trophies in three seasons.'
    }
  ],
  milan: [
    {
      name: 'The Ancelotti & Kaká Era',
      startYear: 2003,
      endYear: 2007,
      description: 'Carlo Ancelotti, Paolo Maldini, and Kaká reaching three Champions League finals and winning two European crowns.'
    }
  ],
  bayern: [
    {
      name: 'The Kahn & Effenberg Era',
      startYear: 1999,
      endYear: 2002,
      description: 'Oliver Kahn and Stefan Effenberg leading Bayern to two Champions League finals and winning the 2001 title in Milan.'
    },
    {
      name: 'The Robben & Ribéry Era',
      startYear: 2010,
      endYear: 2013,
      description: 'Arjen Robben and Franck Ribéry reaching three finals in four seasons and winning the 2013 Wembley Treble.'
    },
    {
      name: 'The Flick & Lewandowski Era',
      startYear: 2020,
      endYear: 2021,
      description: 'Hansi Flick and Robert Lewandowski winning all 11 matches during the historic 2019/20 Sextuple campaign.'
    }
  ],
  man_utd: [
    {
      name: 'The Ferguson & Beckham Era',
      startYear: 1997,
      endYear: 2003,
      description: 'Alex Ferguson and David Beckham securing the historic 1999 Treble and reaching seven consecutive quarter-finals.'
    },
    {
      name: 'The Ferguson & Ronaldo Era',
      startYear: 2007,
      endYear: 2011,
      description: 'Alex Ferguson and Cristiano Ronaldo reaching three Champions League finals in four years and lifting the 2008 trophy.'
    }
  ],
  chelsea: [
    {
      name: 'The Mourinho & Lampard Era',
      startYear: 2005,
      endYear: 2007,
      description: 'José Mourinho and Frank Lampard leading Chelsea to two Champions League semi-finals in three seasons.'
    },
    {
      name: 'The Drogba & Terry Era',
      startYear: 2008,
      endYear: 2012,
      description: 'Didier Drogba and John Terry leading Chelsea to two finals and winning the 2012 title in Munich.'
    },
    {
      name: 'The Tuchel & Kanté Era',
      startYear: 2021,
      endYear: 2023,
      description: 'Thomas Tuchel and N\'Golo Kanté lifting the 2021 trophy in Porto and reaching consecutive quarter-finals.'
    }
  ],
  liverpool: [
    {
      name: 'The Benítez & Gerrard Era',
      startYear: 2005,
      endYear: 2009,
      description: 'Rafael Benítez and Steven Gerrard producing the Miracle of Istanbul and reaching two finals in three years.'
    },
    {
      name: 'The Klopp & Salah Era',
      startYear: 2018,
      endYear: 2022,
      description: 'Jürgen Klopp and Mohamed Salah reaching three Champions League finals in five seasons and lifting the 2019 trophy in Madrid.'
    }
  ],
  inter: [
    {
      name: 'The Mourinho & Milito Era',
      startYear: 2009,
      endYear: 2011,
      description: 'José Mourinho and Diego Milito guiding the Nerazzurri to an unforgettable Italian Treble in Madrid.'
    },
    {
      name: 'The Inzaghi & Lautaro Era',
      startYear: 2023,
      endYear: 2025,
      description: 'Simone Inzaghi and Lautaro Martínez reaching two European finals in three seasons.'
    }
  ],
  juventus: [
    {
      name: 'The Lippi & Del Piero Era',
      startYear: 1996,
      endYear: 1999,
      description: 'Marcello Lippi and Alessandro Del Piero reaching three consecutive Champions League finals and winning the 1996 title in Rome.'
    },
    {
      name: 'The Capello & Nedvěd Era',
      startYear: 2003,
      endYear: 2006,
      description: 'Fabio Capello and Pavel Nedvěd driving Juventus to the 2003 European final and back-to-back quarter-finals.'
    },
    {
      name: 'The Allegri & Buffon Era',
      startYear: 2015,
      endYear: 2018,
      description: 'Massimiliano Allegri and Gianluigi Buffon reaching two European finals in three years.'
    }
  ],
  man_city: [
    {
      name: 'The Guardiola & De Bruyne Era',
      startYear: 2021,
      endYear: 2024,
      description: 'Pep Guardiola and Kevin De Bruyne reaching two finals and sealing the historic Treble in Istanbul.'
    }
  ],
  psg: [
    {
      name: 'The Neymar & Mbappé Era',
      startYear: 2020,
      endYear: 2021,
      description: 'Neymar and Kylian Mbappé leading Paris Saint-Germain to their first Champions League final in Lisbon and consecutive semi-finals.'
    },
    {
      name: 'The Enrique & Dembélé Era',
      startYear: 2024,
      endYear: 2026,
      description: 'Luis Enrique and Ousmane Dembélé reaching three consecutive final fours and winning back-to-back European crowns in 2025 and 2026.'
    }
  ],
  atletico: [
    {
      name: 'The Simeone & Griezmann Era',
      startYear: 2014,
      endYear: 2017,
      description: 'Diego Simeone and Antoine Griezmann leading Atlético de Madrid to two Champions League finals and three semi-finals.'
    }
  ],
  arsenal: [
    {
      name: 'The Wenger & Henry Era',
      startYear: 2004,
      endYear: 2010,
      description: 'Arsène Wenger and Thierry Henry reaching the 2006 final in Paris and sustaining deep knockout runs.'
    },
    {
      name: 'The Arteta & Saka Era',
      startYear: 2024,
      endYear: 2026,
      description: 'Mikel Arteta and Bukayo Saka reaching the quarter-finals, semi-finals, and 2026 final in Budapest.'
    }
  ],
  dortmund: [
    {
      name: 'The Hitzfeld & Sammer Era',
      startYear: 1996,
      endYear: 1998,
      description: 'Ottmar Hitzfeld and Matthias Sammer capturing the 1997 Champions League title in Munich and back-to-back semi-finals.'
    },
    {
      name: 'The Klopp & Lewandowski Era',
      startYear: 2013,
      endYear: 2014,
      description: 'Jürgen Klopp and Robert Lewandowski reaching the 2013 all-German final at Wembley.'
    }
  ]
};

export function getGoldenEras(teamId: string): GoldenEra[] {
  const clubSeasons = getClubSeasons(teamId);
  const defs = CLUB_GOLDEN_ERAS[teamId] || [];

  return defs.map((def, idx) => {
    const eraSeasons = clubSeasons.filter(
      s => s.seasonEndYear >= def.startYear && s.seasonEndYear <= def.endYear
    );
    const duration = eraSeasons.length;
    const titles = eraSeasons.filter(s => s.won).length;
    const finals = eraSeasons.filter(s => s.reachedFinal).length;
    const semiFinals = eraSeasons.filter(s => s.reachedSemiFinal).length;
    const quarterFinals = eraSeasons.filter(s => s.reachedQuarterFinal).length;

    return {
      id: `${teamId}-era-${idx + 1}`,
      name: def.name,
      teamId,
      startYear: def.startYear,
      endYear: def.endYear,
      startSeason: eraSeasons[0]?.seasonLabel || `${def.startYear - 1}/${def.startYear.toString().slice(-2)}`,
      endSeason: eraSeasons[eraSeasons.length - 1]?.seasonLabel || `${def.endYear - 1}/${def.endYear.toString().slice(-2)}`,
      duration,
      titles,
      finals,
      semiFinals,
      quarterFinals,
      qfPlusRate: duration > 0 ? (quarterFinals / duration) * 100 : 0,
      sfPlusRate: duration > 0 ? (semiFinals / duration) * 100 : 0,
      description: def.description,
      seasons: eraSeasons
    };
  });
}

/**
 * Calculate longest consecutive streaks for a club
 */
export function getLongestStreaks(teamId: string) {
  const seasons = getClubSeasons(teamId);

  const calculateStreak = (
    predicate: (r: ClubSeasonRecord) => boolean,
    type: StreakInfo['type'],
    label: string
  ): StreakInfo => {
    let maxLen = 0;
    let currentLen = 0;
    let startIdx = -1;
    let bestStart = -1;
    let bestEnd = -1;

    for (let i = 0; i < seasons.length; i++) {
      if (predicate(seasons[i])) {
        if (currentLen === 0) startIdx = i;
        currentLen++;
        if (currentLen > maxLen) {
          maxLen = currentLen;
          bestStart = startIdx;
          bestEnd = i;
        }
      } else {
        currentLen = 0;
      }
    }

    if (maxLen === 0) {
      return {
        type,
        label,
        length: 0,
        startYear: 0,
        endYear: 0,
        startSeason: '-',
        endSeason: '-',
        active: false
      };
    }

    const lastSeason = seasons[seasons.length - 1];
    const active = bestEnd === seasons.length - 1 && predicate(lastSeason);

    return {
      type,
      label,
      length: maxLen,
      startYear: seasons[bestStart].seasonEndYear,
      endYear: seasons[bestEnd].seasonEndYear,
      startSeason: seasons[bestStart].seasonLabel,
      endSeason: seasons[bestEnd].seasonLabel,
      active
    };
  };

  return {
    participation: calculateStreak(r => r.participated, 'participation', 'Consecutive UCL Participations'),
    r16: calculateStreak(r => r.reachedRoundOf16, 'r16', 'Round of 16+ Streak'),
    qf: calculateStreak(r => r.reachedQuarterFinal, 'qf', 'Quarter-Final+ Streak'),
    sf: calculateStreak(r => r.reachedSemiFinal, 'sf', 'Semi-Final+ Streak'),
    final: calculateStreak(r => r.reachedFinal, 'final', 'Finals Appearance Streak'),
    title: calculateStreak(r => r.won, 'title', 'Consecutive Titles')
  };
}

/**
 * Summary metrics for a club (respecting distinct denominators for participation vs total period)
 */
export function getClubSummaryStats(teamId: string, range?: [number, number]) {
  const seasons = getClubSeasons(teamId, range);
  const totalSeasons = seasons.length;
  const participating = seasons.filter(s => s.participated);
  const participations = participating.length;

  const titles = seasons.filter(s => s.won).length;
  const finals = seasons.filter(s => s.reachedFinal).length;
  const semifinals = seasons.filter(s => s.reachedSemiFinal).length;
  const quarterfinals = seasons.filter(s => s.reachedQuarterFinal).length;
  const roundOf16 = seasons.filter(s => s.reachedRoundOf16).length;

  return {
    totalSeasons,
    participations,
    participationRate: totalSeasons > 0 ? (participations / totalSeasons) * 100 : 0,
    titles,
    finals,
    semifinals,
    quarterfinals,
    roundOf16,
    qfPlusRateParticipation: participations > 0 ? (quarterfinals / participations) * 100 : 0,
    qfPlusRateTotal: totalSeasons > 0 ? (quarterfinals / totalSeasons) * 100 : 0,
    sfPlusRateParticipation: participations > 0 ? (semifinals / participations) * 100 : 0,
    finalRateParticipation: participations > 0 ? (finals / participations) * 100 : 0,
    finalWinRate: finals > 0 ? (titles / finals) * 100 : 0
  };
}

/**
 * Returns cumulative title timeline for a team
 */
export function getCumulativeTitles(teamId: string) {
  const seasons = getClubSeasons(teamId);
  let count = 0;
  return seasons.map(s => {
    if (s.won) count++;
    return {
      year: s.seasonEndYear,
      season: s.seasonLabel,
      axisLabel: s.axisLabel,
      titles: count,
      wonThisSeason: s.won
    };
  });
}

/**
 * Prepares scatter plot data comparing deep run frequency (QF+) vs trophies/finals
 */
export function getLongevityVsPrimeData() {
  const teams = [...new Set(allRecords.map(r => r.teamId))];
  return teams.map(teamId => {
    const stats = getClubSummaryStats(teamId);
    const rec = allRecords.find(r => r.teamId === teamId);
    return {
      teamId,
      teamName: rec ? rec.teamName : teamId,
      qfCount: stats.quarterfinals,
      sfCount: stats.semifinals,
      finalsCount: stats.finals,
      titlesCount: stats.titles,
      participations: stats.participations,
      participationRate: stats.participationRate
    };
  });
}

/**
 * Calculate performance volatility (standard deviation of stage ranks in participating seasons)
 */
export function getPerformanceVolatility(teamId: string) {
  const participating = getClubSeasons(teamId).filter(s => s.participated);
  if (participating.length < 2) return 0;

  const ranks = participating.map(s => s.stageRank);
  const mean = ranks.reduce((sum, r) => sum + r, 0) / ranks.length;
  const variance = ranks.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (ranks.length - 1);
  return Math.sqrt(variance);
}
