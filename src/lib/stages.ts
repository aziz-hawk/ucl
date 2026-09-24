import { NormalizedStage, StageDefinition } from '../types/ucl';

export const STAGE_ORDER: NormalizedStage[] = [
  'winner',
  'runner_up',
  'semi_final',
  'quarter_final',
  'round_of_16',
  'knockout_playoff',
  'league_phase',
  'group_phase',
  'qualifying',
  'did_not_participate'
];

export const STAGE_DEFINITIONS: Record<NormalizedStage, StageDefinition> = {
  winner: {
    id: 'winner',
    label: 'Winner',
    shortLabel: 'W',
    longLabel: 'Champions League Winner',
    plotLevel: 9,
    color: '#B9862B', // Rich Trophy Gold
    badgeBg: 'rgba(185, 134, 43, 0.14)',
    deepRun: true,
    finalAppearance: true,
    title: true,
    description: 'Lifted the European Champion Clubs’ Cup'
  },
  runner_up: {
    id: 'runner_up',
    label: 'Runner-up',
    shortLabel: 'RU',
    longLabel: 'Finalist / Runner-up',
    plotLevel: 8,
    color: '#576375', // Silver Slate
    badgeBg: 'rgba(87, 99, 117, 0.12)',
    deepRun: true,
    finalAppearance: true,
    title: false,
    description: 'Reached the final and finished as runner-up'
  },
  semi_final: {
    id: 'semi_final',
    label: 'Semi-final',
    shortLabel: 'SF',
    longLabel: 'Semi-finalist',
    plotLevel: 7,
    color: '#1836B2', // Royal UCL Blue
    badgeBg: 'rgba(24, 54, 178, 0.10)',
    deepRun: true,
    finalAppearance: false,
    title: false,
    description: 'Reached the final four'
  },
  quarter_final: {
    id: 'quarter_final',
    label: 'Quarter-final',
    shortLabel: 'QF',
    longLabel: 'Quarter-finalist',
    plotLevel: 6,
    color: '#5B2A9E', // Imperial Purple
    badgeBg: 'rgba(91, 42, 158, 0.10)',
    deepRun: true,
    finalAppearance: false,
    title: false,
    description: 'Reached the last eight (deep run benchmark)'
  },
  round_of_16: {
    id: 'round_of_16',
    label: 'Round of 16',
    shortLabel: 'R16',
    longLabel: 'Round of 16',
    plotLevel: 5,
    color: '#0F766E', // Deep Teal
    badgeBg: 'rgba(15, 118, 110, 0.10)',
    deepRun: false,
    finalAppearance: false,
    title: false,
    description: 'First modern knockout round'
  },
  knockout_playoff: {
    id: 'knockout_playoff',
    label: 'Knockout play-off',
    shortLabel: 'PO',
    longLabel: 'Knockout Phase Play-off',
    plotLevel: 4,
    color: '#C2410C', // Warm Terracotta
    badgeBg: 'rgba(194, 65, 12, 0.10)',
    deepRun: false,
    finalAppearance: false,
    title: false,
    description: 'Modern format two-legged play-off round (ranks 9-24 in league phase)'
  },
  league_phase: {
    id: 'league_phase',
    label: 'League phase',
    shortLabel: 'LP',
    longLabel: 'League Phase (36 teams)',
    plotLevel: 3,
    color: '#0284C7', // Clear Blue
    badgeBg: 'rgba(2, 132, 199, 0.10)',
    deepRun: false,
    finalAppearance: false,
    title: false,
    description: 'Exited in the single 36-team Swiss-model league phase (ranks 25-36)'
  },
  group_phase: {
    id: 'group_phase',
    label: 'Group phase',
    shortLabel: 'GRP',
    longLabel: 'Group Stage (First or Second)',
    plotLevel: 2,
    color: '#0369A1', // Deep Cyan/Blue
    badgeBg: 'rgba(3, 105, 161, 0.10)',
    deepRun: false,
    finalAppearance: false,
    title: false,
    description: 'Eliminated during the 4-team group stage (or historical second group phase)'
  },
  qualifying: {
    id: 'qualifying',
    label: 'Qualifying',
    shortLabel: 'Q',
    longLabel: 'Qualifying Rounds',
    plotLevel: 1,
    color: '#854D0E', // Dark Ochre
    badgeBg: 'rgba(133, 77, 14, 0.10)',
    deepRun: false,
    finalAppearance: false,
    title: false,
    description: 'Eliminated in preliminary/qualifying rounds before main tournament'
  },
  did_not_participate: {
    id: 'did_not_participate',
    label: 'Did not participate',
    shortLabel: '-',
    longLabel: 'Did not participate',
    plotLevel: 0,
    color: '#A8A08E', // Editorial Khaki/Stone
    badgeBg: 'rgba(168, 160, 142, 0.12)',
    deepRun: false,
    finalAppearance: false,
    title: false,
    description: 'Did not qualify or enter European Cup / UCL this season'
  }
};

export function getStageDef(stage: NormalizedStage): StageDefinition {
  return STAGE_DEFINITIONS[stage] || STAGE_DEFINITIONS.did_not_participate;
}
