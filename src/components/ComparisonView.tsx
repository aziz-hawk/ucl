import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { ClubSeasonRecord } from '../types/ucl';
import { CLUBS, CLUB_MAP } from '../data/clubs';
import { SEASONS } from '../data/seasons';
import { getClubSeasons, getClubSummaryStats, getLongestStreaks, getBestPrimeWindows } from '../lib/analytics';
import { STAGE_ORDER, STAGE_DEFINITIONS } from '../lib/stages';
import { Check, Plus } from 'lucide-react';

interface ComparisonViewProps {
  onSelectSeasonRecord?: (record: ClubSeasonRecord) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ onSelectSeasonRecord }) => {
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>(['real_madrid']);
  const [hoveredSeasonYear, setHoveredSeasonYear] = useState<number | null>(null);

  const toggleClub = (clubId: string) => {
    if (selectedClubIds.includes(clubId)) {
      setSelectedClubIds(selectedClubIds.filter((id) => id !== clubId));
    } else {
      setSelectedClubIds([...selectedClubIds, clubId]);
    }
  };

  const margin = { top: 25, right: 25, bottom: 40, left: 120 };
  const width = 960;
  const height = 380;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => {
    return d3
      .scalePoint<number>()
      .domain(SEASONS.map((s) => s.seasonEndYear))
      .range([0, innerWidth])
      .padding(0.4);
  }, [innerWidth]);

  const yDomain = useMemo(() => [...STAGE_ORDER].reverse(), []);
  const yScale = useMemo(() => {
    return d3
      .scalePoint<string>()
      .domain(yDomain)
      .range([innerHeight, 0])
      .padding(0.6);
  }, [yDomain, innerHeight]);

  const comparisonData = useMemo(() => {
    return selectedClubIds.map((clubId) => {
      const club = CLUB_MAP.get(clubId);
      const records = getClubSeasons(clubId);
      const stats = getClubSummaryStats(clubId);
      const streaks = getLongestStreaks(clubId);
      const bestPrime = getBestPrimeWindows(clubId, 5)[0];

      const lineGen = d3
        .line<ClubSeasonRecord>()
        .x((d) => xScale(d.seasonEndYear) || 0)
        .y((d) => yScale(d.normalizedStage) || 0)
        .curve(d3.curveMonotoneX);

      return {
        club,
        records,
        stats,
        streaks,
        bestPrime,
        pathD: lineGen(records)
      };
    });
  }, [selectedClubIds, xScale, yScale]);

  return (
    <div className="space-y-5">
      {/* Club Selector Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-card">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Club Comparison
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
            {selectedClubIds.length === 0
              ? 'No Clubs Selected'
              : `${selectedClubIds.length} Club${selectedClubIds.length === 1 ? '' : 's'} Selected`}
          </span>
        </div>

        {/* Club selection pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 w-full">
          {CLUBS.map((club) => {
            const isSelected = selectedClubIds.includes(club.id);
            return (
              <button
                key={club.id}
                onClick={() => toggleClub(club.id)}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all border w-full min-w-0 ${
                  isSelected
                    ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <img
                    src={`${import.meta.env.BASE_URL}crests/${club.id}.png`}
                    alt=""
                    className="w-4 h-4 object-contain shrink-0"
                  />
                  <span className="truncate">{club.shortName}</span>
                </div>
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-card">
        {selectedClubIds.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex flex-wrap items-center gap-3">
                {comparisonData.map(({ club }) => (
                  <div key={club?.id} className="flex items-center space-x-1.5 text-xs font-medium text-gray-700">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: club?.color }}
                    />
                    <span>{club?.shortName}</span>
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-400">1996 to 2026</span>
            </div>

        <div className="overflow-x-auto scrollbar-thin pb-2">
          <div style={{ minWidth: `${width}px` }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
              <g transform={`translate(${margin.left}, ${margin.top})`}>
                {/* Y-axis grid & labels */}
                {yDomain.map((stageKey) => {
                  const y = yScale(stageKey);
                  if (y === undefined) return null;
                  const def = STAGE_DEFINITIONS[stageKey as keyof typeof STAGE_DEFINITIONS];

                  return (
                    <g key={stageKey}>
                      <line
                        x1={0}
                        x2={innerWidth}
                        y1={y}
                        y2={y}
                        stroke="#E5E7EB"
                        strokeDasharray="2, 3"
                      />
                      <text
                        x={-10}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[11px] font-sans"
                        fill="#6B7280"
                      >
                        {def?.label}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical Season Hover Column */}
                {hoveredSeasonYear && xScale(hoveredSeasonYear) !== undefined && (
                  <rect
                    x={(xScale(hoveredSeasonYear) || 0) - 10}
                    y={0}
                    width={20}
                    height={innerHeight}
                    fill="#1D4ED8"
                    opacity={0.06}
                    pointerEvents="none"
                  />
                )}

                {/* Overlaid Club Trajectories */}
                {comparisonData.map(({ club, records, pathD }) => (
                  <g key={club?.id}>
                    {/* Path line */}
                    <path
                      d={pathD || ''}
                      fill="none"
                      stroke={club?.color || '#1D4ED8'}
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={0.8}
                    />

                    {/* Nodes */}
                    {records.map((rec) => {
                      const cx = xScale(rec.seasonEndYear);
                      const cy = yScale(rec.normalizedStage);
                      if (cx === undefined || cy === undefined) return null;

                      return (
                        <circle
                          key={rec.seasonEndYear}
                          cx={cx}
                          cy={cy}
                          r={rec.won ? 5.5 : rec.reachedFinal ? 4.5 : 3}
                          fill={rec.won ? '#F59E0B' : club?.color || '#1D4ED8'}
                          stroke="#FFFFFF"
                          strokeWidth={1.5}
                          className="cursor-pointer"
                          onClick={() => onSelectSeasonRecord && onSelectSeasonRecord(rec)}
                          onMouseEnter={() => setHoveredSeasonYear(rec.seasonEndYear)}
                          onMouseLeave={() => setHoveredSeasonYear(null)}
                        />
                      );
                    })}
                  </g>
                ))}

                {/* X-axis ticks */}
                {SEASONS.map((s) => {
                  const x = xScale(s.seasonEndYear);
                  if (x === undefined) return null;
                  const isHovered = hoveredSeasonYear === s.seasonEndYear;

                  return (
                    <g key={s.seasonEndYear} transform={`translate(${x}, ${innerHeight})`}>
                      <line
                        y1={0}
                        y2={isHovered ? 6 : 4}
                        stroke={isHovered ? '#1D4ED8' : '#E5E7EB'}
                        strokeWidth={1}
                      />
                      <text
                        y={18}
                        textAnchor="middle"
                        className={`text-[11px] font-sans transition-colors ${
                          isHovered ? 'fill-blue-600 font-bold' : 'fill-gray-400 font-medium'
                        }`}
                      >
                        {s.axisLabel}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Select Clubs to Compare
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Click any club pill above to overlay their Champions League journey lines from 1996 to 2026.
            </p>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Cards */}
      {comparisonData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparisonData.map(({ club, stats, streaks, bestPrime }) => (
          <div
            key={club?.id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-card flex flex-col justify-between"
            style={{ borderTop: `3px solid ${club?.color}` }}
          >
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2.5">
                  <img
                    src={`${import.meta.env.BASE_URL}crests/${club?.id}.png`}
                    alt=""
                    className="w-6 h-6 object-contain shrink-0"
                  />
                  <h3 className="text-base font-bold text-gray-900">
                    {club?.name}
                  </h3>
                </div>
                <span className="text-xs text-gray-500 font-medium">{club?.country}</span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="p-3 rounded-lg bg-gray-50/70 border border-gray-200/80">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">UCL Titles</span>
                  <span className="text-xl font-bold text-amber-500 block my-0.5">
                    {stats.titles}
                  </span>
                  <span className="text-[10px] text-gray-500 block">{stats.finals} Finals reached</span>
                </div>

                <div className="p-3 rounded-lg bg-gray-50/70 border border-gray-200/80">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">QF+ Deep Runs</span>
                  <span className="text-xl font-bold text-blue-600 block my-0.5">
                    {stats.quarterfinals}
                  </span>
                  <span className="text-[10px] text-gray-500 block">{stats.semifinals} Semi-finals</span>
                </div>

                <div className="p-3 rounded-lg bg-gray-50/70 border border-gray-200/80">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Participations</span>
                  <span className="text-lg font-bold text-gray-900 block my-0.5">
                    {stats.participations} / 31
                  </span>
                  <span className="text-[10px] text-gray-500 block">{stats.participationRate.toFixed(0)}% frequency</span>
                </div>

                <div className="p-3 rounded-lg bg-gray-50/70 border border-gray-200/80">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Best QF+ Streak</span>
                  <span className="text-lg font-bold text-purple-600 block my-0.5">
                    {streaks.qf.length} Seasons
                  </span>
                  <span className="text-[10px] text-gray-500 block">{streaks.qf.startYear} to {streaks.qf.endYear}</span>
                </div>
              </div>

              {/* Best 5-yr period */}
              {bestPrime && (
                <div className="p-2.5 rounded-lg bg-gray-50/70 border border-gray-200/80 text-xs">
                  <span className="text-[10px] uppercase text-gray-400 font-semibold block mb-0.5">
                    Best 5-Season Window
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-bold">
                      {bestPrime.startSeason.split('/')[0]}/{bestPrime.endSeason.split('/')[1]}
                    </span>
                    <span className="text-gray-500">
                      QF+ {bestPrime.qfPlus}/5 · {bestPrime.titles} Titles
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};
