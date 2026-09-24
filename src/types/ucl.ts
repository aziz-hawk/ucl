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

export interface SourceReference {
  provider: "RSSSF" | "UEFA" | "Other";
  url: string;
  role: "historical_reference" | "official_verification" | "cross_check";
  note?: string;
}

export interface MatchResult {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  penaltiesHome?: number | null;
  penaltiesAway?: number | null;
}

export interface KnockoutTie {
  round: "round_of_16" | "quarter_final" | "semi_final" | "final";
  opponent: string;
  firstLeg?: MatchResult | null;
  secondLeg?: MatchResult | null;
  aggregate?: string | null;
  advanced: boolean;
  decidedOnPenalties?: boolean;
  notes?: string;
}

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
  stageRank: number;

  reachedRoundOf16: boolean;
  reachedQuarterFinal: boolean;
  reachedSemiFinal: boolean;
  reachedFinal: boolean;
  won: boolean;

  leaguePhasePosition?: number | null;
  groupPosition?: number | null;

  finalOpponent?: string | null;
  finalResult?: string | null;

  knockoutPath?: KnockoutTie[];
  sources: SourceReference[];
}

export interface ClubInfo {
  id: string;
  name: string;
  shortName: string;
  country: string;
  city: string;
  stadium: string;
  founded: number;
  color: string;
  secondaryColor: string;
  accentColor: string;
  aliases: string[];
  logoUrl?: string;
}

export interface SeasonInfo {
  seasonEndYear: number;
  seasonLabel: string;
  axisLabel: string;
  isModernFormat: boolean;
  formatNote: string;
  finalVenue?: string;
}

export interface StageDefinition {
  id: NormalizedStage;
  label: string;
  shortLabel: string;
  longLabel: string;
  plotLevel: number;
  color: string;
  badgeBg: string;
  deepRun: boolean;
  finalAppearance: boolean;
  title: boolean;
  description: string;
}

export interface PrimeWindow {
  startYear: number;
  endYear: number;
  startSeason: string;
  endSeason: string;
  windowSize: number;
  participations: number;
  qfPlus: number;
  sfPlus: number;
  finals: number;
  titles: number;
  density: number; // qfPlus / windowSize
  seasons: ClubSeasonRecord[];
}

export interface StreakInfo {
  type: "participation" | "r16" | "qf" | "sf" | "final" | "title";
  label: string;
  length: number;
  startYear: number;
  endYear: number;
  startSeason: string;
  endSeason: string;
  active?: boolean;
}

export interface GoldenEra {
  id: string;
  name: string;
  teamId: string;
  startYear: number;
  endYear: number;
  startSeason: string;
  endSeason: string;
  duration: number; // in seasons
  titles: number;
  finals: number;
  semiFinals: number;
  quarterFinals: number;
  qfPlusRate: number; // 0 to 100 percentage
  sfPlusRate: number; // 0 to 100 percentage
  description: string;
  seasons: ClubSeasonRecord[];
}
