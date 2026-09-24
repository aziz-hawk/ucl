import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, Search, ArrowUpDown } from 'lucide-react';
import { CLUBS, CLUB_MAP } from '../data/clubs';
import { SEASONS } from '../data/seasons';
import { ClubSeasonRecord } from '../types/ucl';
import { getClubSeasons } from '../lib/analytics';

interface FinalsViewProps {
  onSelectClub: (clubId: string) => void;
  onSelectSeasonRecord: (record: ClubSeasonRecord) => void;
}

interface FinalMatchData {
  seasonEndYear: number;
  seasonLabel: string;
  winnerTeamId?: string;
  winnerName: string;
  winnerWon: boolean;
  winnerRecord?: ClubSeasonRecord;
  runnerUpTeamId?: string;
  runnerUpName: string;
  runnerUpRecord?: ClubSeasonRecord;
  score: string;
  venue: string;
  formatNote?: string;
  isModernFormat?: boolean;
}

const EXTERNAL_CLUBS: Record<string, { name: string; short: string; bg: string; text: string }> = {
  'Porto': { name: 'Porto', short: 'FCP', bg: 'bg-blue-700', text: 'text-white' },
  'Monaco': { name: 'Monaco', short: 'ASM', bg: 'bg-red-600', text: 'text-white' },
  'Ajax': { name: 'Ajax', short: 'AJX', bg: 'bg-red-700', text: 'text-white' },
  'Valencia': { name: 'Valencia', short: 'VAL', bg: 'bg-orange-500', text: 'text-white' },
  'Bayer Leverkusen': { name: 'Bayer Leverkusen', short: 'B04', bg: 'bg-red-800', text: 'text-white' },
  'Tottenham Hotspur': { name: 'Tottenham Hotspur', short: 'TOT', bg: 'bg-slate-800', text: 'text-white' },
};

export const FinalsView: React.FC<FinalsViewProps> = ({ onSelectClub, onSelectSeasonRecord }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedWinnerFilter, setSelectedWinnerFilter] = useState<string>('all');

  // Compute complete 31 finals data
  const finalsList: FinalMatchData[] = useMemo(() => {
    return SEASONS.map((s) => {
      // Check 2004 special case (Porto vs Monaco)
      if (s.seasonEndYear === 2004) {
        return {
          seasonEndYear: 2004,
          seasonLabel: s.seasonLabel,
          winnerTeamId: undefined,
          winnerName: 'Porto',
          winnerWon: true,
          runnerUpTeamId: undefined,
          runnerUpName: 'Monaco',
          score: '3-0',
          venue: s.finalVenue || 'Arena AufSchalke, Gelsenkirchen',
          formatNote: s.formatNote,
          isModernFormat: s.isModernFormat,
        };
      }

      const resultsInSeason = CLUBS.map((c) => {
        const recs = getClubSeasons(c.id);
        return recs.find((r: ClubSeasonRecord) => r.seasonEndYear === s.seasonEndYear);
      }).filter((r): r is ClubSeasonRecord => r !== undefined);

      const winnerRec = resultsInSeason.find((r) => r.won);
      const runnerUpRec = resultsInSeason.find((r) => r.normalizedStage === 'runner_up');

      const rawScore = winnerRec?.finalResult || '';
      // Sanitize any en-dash or em-dash in score
      const cleanScore = rawScore
        .replace(/\u2013/g, '-')
        .replace(/\u2014/g, '-')
        .replace(/^Won\s*/i, '');

      const runnerUpName = runnerUpRec
        ? runnerUpRec.teamName
        : winnerRec?.finalOpponent || 'Finalist';

      // Check if runnerUpName matches a canonical club
      const matchingRunnerUpClub = CLUBS.find(
        (c) => c.name.toLowerCase() === runnerUpName.toLowerCase() || c.id === runnerUpName.toLowerCase()
      );

      return {
        seasonEndYear: s.seasonEndYear,
        seasonLabel: s.seasonLabel,
        winnerTeamId: winnerRec?.teamId,
        winnerName: winnerRec?.teamName || 'Champion',
        winnerWon: true,
        winnerRecord: winnerRec,
        runnerUpTeamId: runnerUpRec?.teamId || matchingRunnerUpClub?.id,
        runnerUpName,
        runnerUpRecord: runnerUpRec,
        score: cleanScore || 'Finalist',
        venue: s.finalVenue || 'European Stadium',
        formatNote: s.formatNote,
        isModernFormat: s.isModernFormat,
      };
    });
  }, []);

  // Summary counts
  const summaryStats = useMemo(() => {
    const titlesByTeam: Record<string, number> = {};
    let shootouts = 0;

    finalsList.forEach((f) => {
      titlesByTeam[f.winnerName] = (titlesByTeam[f.winnerName] || 0) + 1;
      if (f.score.toLowerCase().includes('pens') || f.score.toLowerCase().includes('pen')) {
        shootouts++;
      }
    });

    const uniqueChampionsCount = Object.keys(titlesByTeam).length;
    const topWinners = Object.entries(titlesByTeam)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalFinals: finalsList.length,
      uniqueChampionsCount,
      shootouts,
      topWinners,
    };
  }, [finalsList]);

  // Filter & sort
  const filteredFinals = useMemo(() => {
    let result = [...finalsList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.winnerName.toLowerCase().includes(q) ||
          f.runnerUpName.toLowerCase().includes(q) ||
          f.venue.toLowerCase().includes(q) ||
          f.seasonLabel.toLowerCase().includes(q) ||
          f.seasonEndYear.toString().includes(q)
      );
    }

    if (selectedWinnerFilter !== 'all') {
      result = result.filter((f) => f.winnerName === selectedWinnerFilter);
    }

    if (sortOrder === 'asc') {
      result.sort((a, b) => a.seasonEndYear - b.seasonEndYear);
    } else {
      result.sort((a, b) => b.seasonEndYear - a.seasonEndYear);
    }

    return result;
  }, [finalsList, searchQuery, selectedWinnerFilter, sortOrder]);

  const renderClubAvatar = (name: string, clubId?: string) => {
    if (clubId && CLUB_MAP.has(clubId)) {
      return (
        <img
          src={`${import.meta.env.BASE_URL}crests/${clubId}.png`}
          alt={name}
          className="w-5 h-5 object-contain shrink-0"
        />
      );
    }

    const external = EXTERNAL_CLUBS[name];
    if (external) {
      return (
        <div
          className={`w-5 h-5 rounded-full ${external.bg} ${external.text} flex items-center justify-center text-[9px] font-bold shrink-0 shadow-xs`}
          title={name}
        >
          {external.short.slice(0, 2)}
        </div>
      );
    }

    return (
      <div className="w-5 h-5 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-[9px] font-bold shrink-0">
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Summary Cards */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                1996 to 2026
              </span>
              <span className="text-xs text-gray-400 font-medium">31 Completed Finals</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mt-1">
              Finals (1996 to 2026)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Three decades of European finals, scorelines, winning margins, and legendary match venues
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-center">
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors shadow-xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
              <span>{sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
          <div className="bg-gray-50/70 border border-gray-200 rounded-lg p-2.5">
            <div className="text-[11px] text-gray-500 font-medium">Total Finals</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">31</div>
          </div>
          <div className="bg-gray-50/70 border border-gray-200 rounded-lg p-2.5">
            <div className="text-[11px] text-gray-500 font-medium">Different Champions</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">{summaryStats.uniqueChampionsCount} Clubs</div>
          </div>
          <div className="bg-gray-50/70 border border-gray-200 rounded-lg p-2.5">
            <div className="text-[11px] text-gray-500 font-medium">Penalty Shootouts</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">{summaryStats.shootouts} Finals</div>
          </div>
          <div className="bg-gray-50/70 border border-gray-200 rounded-lg p-2.5">
            <div className="text-[11px] text-gray-500 font-medium">Most Titles in Era</div>
            <div className="text-lg font-bold text-amber-600 mt-0.5">Real Madrid (9)</div>
          </div>
        </div>

        {/* Search & Club Quick Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search final by club, city, venue, or year (e.g. Real Madrid, Wembley, 2014)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Winner Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5 text-xs">
            <button
              onClick={() => setSelectedWinnerFilter('all')}
              className={`px-2.5 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${
                selectedWinnerFilter === 'all'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              All Champions
            </button>
            {summaryStats.topWinners.map(([name, count]) => (
              <button
                key={name}
                onClick={() => setSelectedWinnerFilter(selectedWinnerFilter === name ? 'all' : name)}
                className={`px-2.5 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                  selectedWinnerFilter === name
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{name}</span>
                <span className={`text-[10px] px-1 rounded ${selectedWinnerFilter === name ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 31 Finals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredFinals.map((final) => {
          const isWinnerCanonical = Boolean(final.winnerTeamId && CLUB_MAP.has(final.winnerTeamId));
          const isRunnerUpCanonical = Boolean(final.runnerUpTeamId && CLUB_MAP.has(final.runnerUpTeamId));

          return (
            <div
              key={final.seasonEndYear}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-card hover:border-gray-300 transition-all flex flex-col justify-between space-y-3 group"
            >
              {/* Header: Season & Year Badge */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900 text-sm">
                    {final.seasonLabel}
                  </span>
                  {final.isModernFormat && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Swiss League
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-md">
                    {final.seasonEndYear} Final
                  </span>
                  {final.winnerRecord && (
                    <button
                      onClick={() => onSelectSeasonRecord(final.winnerRecord!)}
                      title="Inspect season match details"
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Match Teams & Result */}
              <div className="space-y-2 py-1">
                {/* Champion Row */}
                <div
                  onClick={() => {
                    if (isWinnerCanonical && final.winnerTeamId) {
                      onSelectClub(final.winnerTeamId);
                    } else if (final.winnerRecord) {
                      onSelectSeasonRecord(final.winnerRecord);
                    }
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg bg-amber-50/50 border border-amber-100 transition-colors ${
                    isWinnerCanonical ? 'cursor-pointer hover:bg-amber-100/60' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0 shadow-xs">
                      ★
                    </span>
                    {renderClubAvatar(final.winnerName, final.winnerTeamId)}
                    <span className="font-bold text-sm text-gray-900 truncate">
                      {final.winnerName}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-amber-700 shrink-0 ml-2">
                    Champion
                  </span>
                </div>

                {/* Score Banner */}
                <div className="flex items-center justify-center py-1">
                  <div className="px-3 py-1 rounded-md bg-gray-100 border border-gray-200/80 text-xs font-bold text-gray-800 tracking-wide shadow-2xs">
                    {final.score}
                  </div>
                </div>

                {/* Runner-up Row */}
                <div
                  onClick={() => {
                    if (isRunnerUpCanonical && final.runnerUpTeamId) {
                      onSelectClub(final.runnerUpTeamId);
                    } else if (final.runnerUpRecord) {
                      onSelectSeasonRecord(final.runnerUpRecord);
                    }
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg bg-gray-50/70 border border-gray-200 transition-colors ${
                    isRunnerUpCanonical ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="w-4 h-4 rounded-full bg-slate-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0 shadow-xs">
                      ●
                    </span>
                    {renderClubAvatar(final.runnerUpName, final.runnerUpTeamId)}
                    <span className="font-semibold text-xs text-gray-700 truncate">
                      {final.runnerUpName}
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-gray-500 shrink-0 ml-2">
                    Runner-up
                  </span>
                </div>
              </div>

              {/* Venue & Notes Footer */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <div className="flex items-center space-x-1.5 truncate">
                  <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="truncate">{final.venue}</span>
                </div>

                {final.winnerRecord && (
                  <button
                    onClick={() => onSelectSeasonRecord(final.winnerRecord!)}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] shrink-0 ml-2 transition-colors"
                  >
                    Details
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredFinals.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-card">
          <p className="text-gray-500 text-sm">No finals found matching "{searchQuery}".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedWinnerFilter('all');
            }}
            className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
