import React, { useState, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { ClubSeasonRecord, GoldenEra } from '../types/ucl';
import { getClubSeasons, getClubSummaryStats, getGoldenEras } from '../lib/analytics';
import { STAGE_ORDER, STAGE_DEFINITIONS, getStageDef } from '../lib/stages';
import { CLUB_MAP } from '../data/clubs';
import { Trophy } from 'lucide-react';

interface UclJourneyProps {
  selectedClubId: string;
  onSelectSeason?: (record: ClubSeasonRecord) => void;
  onExplorePrime?: () => void;
  onCompareClubs?: () => void;
}

export const UclJourney: React.FC<UclJourneyProps> = ({
  selectedClubId,
  onSelectSeason,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredRecord, setHoveredRecord] = useState<ClubSeasonRecord | null>(null);
  const [hoveredEra, setHoveredEra] = useState<GoldenEra | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const club = CLUB_MAP.get(selectedClubId);
  const seasons = useMemo(() => getClubSeasons(selectedClubId), [selectedClubId]);
  const stats = useMemo(() => getClubSummaryStats(selectedClubId), [selectedClubId]);
  const goldenEras = useMemo(() => getGoldenEras(selectedClubId), [selectedClubId]);

  // Dimensions
  const margin = { top: 30, right: 30, bottom: 45, left: 130 };
  const width = 1000;
  const height = 450;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const xScale = useMemo(() => {
    return d3
      .scalePoint<number>()
      .domain(seasons.map((d) => d.seasonEndYear))
      .range([0, innerWidth])
      .padding(0.5);
  }, [seasons, innerWidth]);

  // Stage plotting order: winner at top, did_not_participate at bottom
  const yDomain = useMemo(() => [...STAGE_ORDER].reverse(), []);
  const yScale = useMemo(() => {
    return d3
      .scalePoint<string>()
      .domain(yDomain)
      .range([innerHeight, 0])
      .padding(0.6);
  }, [yDomain, innerHeight]);

  // Generate a single continuous line through ALL 31 seasons (including non-participation)
  const paths = useMemo(() => {
    const lineGenerator = d3
      .line<ClubSeasonRecord>()
      .x((d) => xScale(d.seasonEndYear) || 0)
      .y((d) => yScale(d.normalizedStage) || 0)
      .curve(d3.curveMonotoneX);

    const pathD = lineGenerator(seasons);
    return pathD ? [pathD] : [];
  }, [seasons, xScale, yScale]);

  // Generate the full area path under the curve for prime highlights
  const fullAreaPathD = useMemo(() => {
    const areaGenerator = d3
      .area<ClubSeasonRecord>()
      .x((d) => xScale(d.seasonEndYear) || 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.normalizedStage) || 0)
      .curve(d3.curveMonotoneX);

    return areaGenerator(seasons) || '';
  }, [seasons, xScale, yScale, innerHeight]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-card space-y-4">
      {/* Club Profile & Key Metrics (Compact Unified Header Row) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-gray-100">
        {/* Left: Club Info */}
        <div className="flex items-center space-x-3 min-w-0">
          <img
            src={`${import.meta.env.BASE_URL}crests/${selectedClubId}.png`}
            alt={`${club?.name} crest`}
            className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-tight truncate">
              {club?.name}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {club?.country} · Founded {club?.founded} · {club?.stadium}
            </p>
          </div>
        </div>

        {/* Right: Clean Stat Badges */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="bg-gray-50/80 border border-gray-200/80 rounded-lg px-3 py-1.5 min-w-[120px]">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">UCL Titles</span>
            <div className="text-base font-bold text-gray-900 flex items-center gap-1.5 leading-none mt-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{stats.titles}</span>
              <span className="text-[11px] font-normal text-gray-500 ml-1">
                ({stats.finals} Finals)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas with horizontal scrolling container for small screens */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto scrollbar-thin pb-2"
        tabIndex={0}
        aria-label={`${club?.name} UEFA Champions League finishing stage history chart from 1996 to 2026`}
      >
          <div style={{ minWidth: `${width}px`, position: 'relative' }}>
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto select-none"
              style={{ maxHeight: '480px' }}
            >
              <defs>
                <filter id="gold-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#F59E0B" floodOpacity="0.4" />
                </filter>
                <linearGradient id={`prime-area-grad-${selectedClubId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={club?.color || '#1D4ED8'} stopOpacity={0.16} />
                  <stop offset="100%" stopColor={club?.color || '#1D4ED8'} stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <g transform={`translate(${margin.left}, ${margin.top})`}>
                {/* Horizontal Grid Lines & Y-axis labels */}
                {yDomain.map((stageKey) => {
                  const y = yScale(stageKey);
                  if (y === undefined) return null;
                  const def = STAGE_DEFINITIONS[stageKey as keyof typeof STAGE_DEFINITIONS];
                  const isQf = stageKey === 'quarter_final';

                  return (
                    <g key={stageKey}>
                      <line
                        x1={0}
                        x2={innerWidth}
                        y1={y}
                        y2={y}
                        stroke={isQf ? '#7C3AED' : '#E5E7EB'}
                        strokeWidth={isQf ? 1.2 : 1}
                        strokeDasharray={isQf ? '4, 4' : '2, 3'}
                        opacity={isQf ? 0.7 : 0.8}
                      />
                      <text
                        x={-12}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[11px] font-sans select-none"
                        fill={isQf ? '#7C3AED' : '#4B5563'}
                        fontWeight={def?.deepRun ? 600 : 400}
                      >
                        {def?.label}
                      </text>
                    </g>
                  );
                })}

                {/* Highlight Area Under Curve for Golden Eras (Prime Years) */}
                {goldenEras.map((era) => {
                  const x1 = xScale(era.startYear);
                  const x2 = xScale(era.endYear);
                  if (x1 === undefined || x2 === undefined) return null;

                  const clipId = `era-clip-${era.id}`;
                  const width = Math.max(x2 - x1, 2);

                  const isEraHovered = hoveredEra?.id === era.id;

                  return (
                    <g
                      key={era.id}
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        setHoveredEra(era);
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setMousePos({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top
                          });
                        }
                      }}
                      onMouseMove={(e) => {
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setMousePos({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredEra(null)}
                    >
                      <defs>
                        <clipPath id={clipId}>
                          <rect x={x1} y={0} width={width} height={innerHeight} />
                        </clipPath>
                      </defs>

                      {/* Faint Highlight Area Under the Curve */}
                      <path
                        d={fullAreaPathD}
                        fill={`url(#prime-area-grad-${selectedClubId})`}
                        clipPath={`url(#${clipId})`}
                        style={{
                          opacity: isEraHovered ? 1.8 : 1,
                          transition: 'opacity 0.15s ease'
                        }}
                      />

                      {/* Interactive Transparent Hit Area across the era width */}
                      <rect
                        x={x1}
                        y={0}
                        width={width}
                        height={innerHeight}
                        fill="transparent"
                      />

                      {/* Subtle vertical boundary lines */}
                      <line
                        x1={x1}
                        x2={x1}
                        y1={yScale(era.seasons[0]?.normalizedStage) ?? 0}
                        y2={innerHeight}
                        stroke={club?.color || '#1D4ED8'}
                        strokeWidth={isEraHovered ? 1.5 : 1}
                        strokeDasharray="2, 2"
                        opacity={isEraHovered ? 0.6 : 0.3}
                      />
                      <line
                        x1={x2}
                        x2={x2}
                        y1={yScale(era.seasons[era.seasons.length - 1]?.normalizedStage) ?? 0}
                        y2={innerHeight}
                        stroke={club?.color || '#1D4ED8'}
                        strokeWidth={isEraHovered ? 1.5 : 1}
                        strokeDasharray="2, 2"
                        opacity={isEraHovered ? 0.6 : 0.3}
                      />
                    </g>
                  );
                })}

                {/* Connecting Line for all 31 seasons */}
                {paths.map((pathD, idx) => (
                  <path
                    key={idx}
                    d={pathD || ''}
                    fill="none"
                    stroke={club?.color || '#1D4ED8'}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.85}
                  />
                ))}

                {/* Data Points for each season */}
                {seasons.map((rec) => {
                  const cx = xScale(rec.seasonEndYear);
                  const cy = yScale(rec.normalizedStage);
                  if (cx === undefined || cy === undefined) return null;

                  const stageDef = getStageDef(rec.normalizedStage);
                  const isHovered = hoveredRecord?.seasonEndYear === rec.seasonEndYear;
                  const isWon = rec.won;
                  const isFinalist = rec.reachedFinal;

                  return (
                    <g
                      key={rec.seasonEndYear}
                      transform={`translate(${cx}, ${cy})`}
                      className="cursor-pointer"
                      onClick={() => onSelectSeason && onSelectSeason(rec)}
                      onMouseEnter={(e) => {
                        setHoveredRecord(rec);
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setMousePos({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredRecord(null)}
                    >
                      {/* Larger hit target */}
                      <circle r={14} fill="transparent" />

                      {isWon ? (
                        <g filter="url(#gold-glow)">
                          <circle r={isHovered ? 11 : 9} fill="#F59E0B" stroke="#FFFFFF" strokeWidth={2} />
                          <path
                            d="M0 -4.5 L1.3 -1.4 L4.5 -1 L2.2 1.1 L2.8 4.2 L0 2.7 L-2.8 4.2 L-2.2 1.1 L-4.5 -1 L-1.3 -1.4 Z"
                            fill="#FFFFFF"
                          />
                        </g>
                      ) : isFinalist ? (
                        <circle
                          r={isHovered ? 9 : 7}
                          fill="#64748B"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        />
                      ) : !rec.participated ? (
                        <circle
                          r={isHovered ? 3.5 : 2.5}
                          fill="#CBD5E1"
                        />
                      ) : (
                        <circle
                          r={isHovered ? 7 : stageDef.deepRun ? 5.5 : 4}
                          fill={stageDef.color}
                          stroke="#FFFFFF"
                          strokeWidth={1.6}
                        />
                      )}
                    </g>
                  );
                })}

                {/* X-axis ticks & labels */}
                {seasons.map((rec) => {
                  const x = xScale(rec.seasonEndYear);
                  if (x === undefined) return null;
                  const isHovered = hoveredRecord?.seasonEndYear === rec.seasonEndYear;
                  const isPrime = goldenEras.some(
                    (e) => rec.seasonEndYear >= e.startYear && rec.seasonEndYear <= e.endYear
                  );

                  return (
                    <g key={rec.seasonEndYear} transform={`translate(${x}, ${innerHeight})`}>
                      <line
                        y1={0}
                        y2={isHovered ? 7 : isPrime ? 5 : 4}
                        stroke={isHovered ? '#1D4ED8' : isPrime ? (club?.color || '#1D4ED8') : '#E5E7EB'}
                        strokeWidth={isHovered ? 2 : isPrime ? 1.5 : 1}
                      />
                      <text
                        y={18}
                        textAnchor="middle"
                        className={`text-[11px] font-sans select-none transition-colors ${
                          isHovered
                            ? 'fill-blue-600 font-bold'
                            : isPrime
                            ? 'fill-gray-900 font-bold'
                            : 'fill-gray-400 font-medium'
                        }`}
                      >
                        {rec.axisLabel}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis title */}
                <text
                  x={innerWidth / 2}
                  y={innerHeight + 36}
                  textAnchor="middle"
                  className="text-xs font-sans text-gray-400 select-none"
                >
                  Season Ending Year (1996 → 2026)
                </text>
              </g>
            </svg>

            {/* Clean FotMob Style Tooltip - NO "Click to inspect" and NO "Source:..." */}
            {hoveredRecord && (
              <div
                className="absolute z-20 pointer-events-none p-3 rounded-lg bg-gray-900 text-white shadow-xl text-xs transition-all duration-75"
                style={{
                  left: Math.min(Math.max(mousePos.x - 100, 10), width - 220),
                  top: Math.max(mousePos.y - 95, 10),
                  minWidth: '190px'
                }}
              >
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-gray-700">
                  <span className="font-semibold text-gray-200">{hoveredRecord.seasonLabel}</span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold text-white"
                    style={{ backgroundColor: getStageDef(hoveredRecord.normalizedStage).color }}
                  >
                    {getStageDef(hoveredRecord.normalizedStage).shortLabel}
                  </span>
                </div>

                <div className="font-bold text-white text-sm">
                  {hoveredRecord.teamName}
                </div>
                <div className="text-gray-300 text-xs mt-0.5">
                  Stage: {getStageDef(hoveredRecord.normalizedStage).longLabel}
                </div>

                {hoveredRecord.reachedFinal && hoveredRecord.finalOpponent && (
                  <div className="mt-1.5 pt-1.5 border-t border-gray-700 text-[11px] text-amber-300">
                    Final vs {hoveredRecord.finalOpponent}
                    {hoveredRecord.finalResult && <div>Result: {hoveredRecord.finalResult}</div>}
                  </div>
                )}

                {(() => {
                  const recordEra = goldenEras.find(
                    (e) => hoveredRecord.seasonEndYear >= e.startYear && hoveredRecord.seasonEndYear <= e.endYear
                  );
                  return recordEra ? (
                    <div className="mt-1.5 pt-1 border-t border-gray-700/60 text-[10px] font-medium text-emerald-400">
                      Golden Era: {recordEra.name}
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Clean FotMob Style Era Tooltip on Hovering Over Prime Highlight */}
            {hoveredEra && !hoveredRecord && (
              <div
                className="absolute z-20 pointer-events-none p-3 rounded-lg bg-gray-900 text-white shadow-xl text-xs transition-all duration-75"
                style={{
                  left: Math.min(Math.max(mousePos.x - 110, 10), width - 240),
                  top: Math.max(mousePos.y - 100, 10),
                  minWidth: '210px'
                }}
              >
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-gray-700">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                    Golden Era (Prime)
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {hoveredEra.duration} seasons
                  </span>
                </div>

                <div className="font-bold text-white text-sm">
                  {hoveredEra.name}
                </div>
                <div className="text-gray-300 text-xs mt-0.5">
                  {hoveredEra.startSeason} to {hoveredEra.endSeason}
                </div>

                <div className="mt-2 pt-1.5 border-t border-gray-700 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div>
                    <span className="text-gray-400 block">Titles</span>
                    <span className="font-bold text-amber-400 text-xs">{hoveredEra.titles}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Finals</span>
                    <span className="font-bold text-white text-xs">{hoveredEra.finals}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">QF+</span>
                    <span className="font-bold text-blue-400 text-xs">{hoveredEra.qfPlusRate.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clean Stage Legend at bottom */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5 text-gray-800 font-medium">
              <span className="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center text-[7px] text-white font-bold">★</span>
              Winner
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
              Runner-up
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              Semi-final
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
              Quarter-final
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              Did not participate
            </span>
            <span className="flex items-center gap-1.5 sm:ml-2 sm:border-l sm:border-gray-200 sm:pl-3">
              <span
                className="w-3.5 h-2.5 rounded-xs border"
                style={{
                  backgroundColor: club?.color || '#1D4ED8',
                  borderColor: club?.color || '#1D4ED8',
                  opacity: 0.35
                }}
              />
              <span className="text-gray-700 font-medium">Golden Era (Prime)</span>
            </span>
          </div>
        </div>
      </div>
  );
};
