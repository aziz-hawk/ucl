import { ClubInfo } from '../types/ucl';

export const CLUBS: ClubInfo[] = [
  // --- England (5 clubs) ---
  {
    id: 'arsenal',
    name: 'Arsenal',
    shortName: 'Arsenal',
    country: 'England',
    city: 'London',
    stadium: 'Emirates Stadium',
    founded: 1886,
    color: '#BE123C', // Gunner Scarlet Crimson
    secondaryColor: '#FFFFFF',
    accentColor: '#9F1239',
    aliases: ['Arsenal FC', 'The Gunners', 'AFC']
  },
  {
    id: 'chelsea',
    name: 'Chelsea',
    shortName: 'Chelsea',
    country: 'England',
    city: 'London',
    stadium: 'Stamford Bridge',
    founded: 1905,
    color: '#2563EB', // Royal Blue
    secondaryColor: '#FFFFFF',
    accentColor: '#1D4ED8',
    aliases: ['Chelsea FC', 'Chelsea London', 'The Blues']
  },
  {
    id: 'liverpool',
    name: 'Liverpool',
    shortName: 'Liverpool',
    country: 'England',
    city: 'Liverpool',
    stadium: 'Anfield',
    founded: 1892,
    color: '#991B1B', // Deep Anfield Crimson
    secondaryColor: '#10B981',
    accentColor: '#7F1D1D',
    aliases: ['Liverpool FC', 'The Reds']
  },
  {
    id: 'man_city',
    name: 'Manchester City',
    shortName: 'Man City',
    country: 'England',
    city: 'Manchester',
    stadium: 'Etihad Stadium',
    founded: 1880,
    color: '#06B6D4', // Cityzens Sky Cyan
    secondaryColor: '#FFFFFF',
    accentColor: '#0891B2',
    aliases: ['Manchester City FC', 'Man City', 'Cityzens']
  },
  {
    id: 'man_utd',
    name: 'Manchester United',
    shortName: 'Man Utd',
    country: 'England',
    city: 'Manchester',
    stadium: 'Old Trafford',
    founded: 1878,
    color: '#EA580C', // Warm Vermilion / Red Devils
    secondaryColor: '#FACC15',
    accentColor: '#C2410C',
    aliases: ['Man United', 'Manchester Utd', 'Manchester United FC', 'Red Devils']
  },

  // --- Germany (2 clubs) ---
  {
    id: 'bayern',
    name: 'Bayern Munich',
    shortName: 'Bayern',
    country: 'Germany',
    city: 'Munich',
    stadium: 'Allianz Arena',
    founded: 1900,
    color: '#DC2626', // Bavarian Red
    secondaryColor: '#FFFFFF',
    accentColor: '#B91C1C',
    aliases: ['Bayern München', 'Bayern Munchen', 'FC Bayern']
  },
  {
    id: 'dortmund',
    name: 'Borussia Dortmund',
    shortName: 'Dortmund',
    country: 'Germany',
    city: 'Dortmund',
    stadium: 'Signal Iduna Park',
    founded: 1909,
    color: '#EAB308', // BVB Yellow
    secondaryColor: '#0F172A',
    accentColor: '#CA8A04',
    aliases: ['Dortmund', 'BV Borussia 09 Dortmund', 'Borussia Dortmund 09', 'BVB']
  },

  // --- Spain (3 clubs) ---
  {
    id: 'real_madrid',
    name: 'Real Madrid',
    shortName: 'Real Madrid',
    country: 'Spain',
    city: 'Madrid',
    stadium: 'Santiago Bernabéu',
    founded: 1902,
    color: '#D97706', // Rich Gold / Amber
    secondaryColor: '#FFFFFF',
    accentColor: '#B45309',
    aliases: ['Real Madrid CF', 'Real Madrid Club de Fútbol', 'Los Blancos']
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    shortName: 'Barcelona',
    country: 'Spain',
    city: 'Barcelona',
    stadium: 'Spotify Camp Nou',
    founded: 1899,
    color: '#7C3AED', // Blaugrana Violet
    secondaryColor: '#EF4444',
    accentColor: '#6D28D9',
    aliases: ['FC Barcelona', 'Barça', 'Blaugrana']
  },
  {
    id: 'atletico',
    name: 'Atlético de Madrid',
    shortName: 'Atlético',
    country: 'Spain',
    city: 'Madrid',
    stadium: 'Metropolitano',
    founded: 1903,
    color: '#F43F5E', // Colchoneros Rose Red
    secondaryColor: '#38BDF8',
    accentColor: '#E11D48',
    aliases: ['Atletico Madrid', 'Atlético Madrid', 'Atlético de Madrid CF', 'Colchoneros']
  },

  // --- Italy (3 clubs) ---
  {
    id: 'milan',
    name: 'AC Milan',
    shortName: 'Milan',
    country: 'Italy',
    city: 'Milan',
    stadium: 'San Siro',
    founded: 1899,
    color: '#1E293B', // Rossoneri Charcoal / Black
    secondaryColor: '#DC2626',
    accentColor: '#0F172A',
    aliases: ['Milan', 'Milan AC', 'AC Milan', 'Rossoneri']
  },
  {
    id: 'inter',
    name: 'Inter',
    shortName: 'Inter',
    country: 'Italy',
    city: 'Milan',
    stadium: 'San Siro',
    founded: 1908,
    color: '#0284C7', // Nerazzurri Ocean Blue
    secondaryColor: '#0F172A',
    accentColor: '#0369A1',
    aliases: ['Internazionale', 'Inter Milan', 'Inter Milano', 'Nerazzurri']
  },
  {
    id: 'juventus',
    name: 'Juventus',
    shortName: 'Juventus',
    country: 'Italy',
    city: 'Turin',
    stadium: 'Allianz Stadium (Turin)',
    founded: 1897,
    color: '#475569', // Bianconeri Slate / Charcoal
    secondaryColor: '#0F172A',
    accentColor: '#334155',
    aliases: ['Juventus FC', 'Juventus Torino', 'FC Juventus', 'Bianconeri']
  },

  // --- France (1 club) ---
  {
    id: 'psg',
    name: 'Paris Saint-Germain',
    shortName: 'PSG',
    country: 'France',
    city: 'Paris',
    stadium: 'Parc des Princes',
    founded: 1970,
    color: '#4F46E5', // Parc des Princes Indigo / Navy
    secondaryColor: '#EF4444',
    accentColor: '#4338CA',
    aliases: ['PSG', 'Paris SG', 'Paris Saint-Germain FC']
  }
];

export const CLUB_MAP = new Map<string, ClubInfo>(
  CLUBS.map(club => [club.id, club])
);

export const CLUB_NAME_TO_ID: Record<string, string> = {
  'Chelsea': 'chelsea',
  'Juventus': 'juventus',
  'Milan': 'milan',
  'AC Milan': 'milan',
  'Inter': 'inter',
  'Liverpool': 'liverpool',
  'Bayern Munich': 'bayern',
  'Manchester United': 'man_utd',
  'Manchester City': 'man_city',
  'Real Madrid': 'real_madrid',
  'Barcelona': 'barcelona',
  'Atletico Madrid': 'atletico',
  'Atlético de Madrid': 'atletico',
  'Dortmund': 'dortmund',
  'Borussia Dortmund': 'dortmund',
  'PSG': 'psg',
  'Paris Saint-Germain': 'psg',
  'Arsenal': 'arsenal',
  'Arsenal FC': 'arsenal'
};
