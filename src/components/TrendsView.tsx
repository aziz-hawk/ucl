import React, { useState, useMemo } from 'react';
import { CLUBS, CLUB_MAP } from '../data/clubs';
import { getClubSummaryStats, getLongevityVsPrimeData } from '../lib/analytics';
import { Trophy, TrendingUp, Info } from 'lucide-react';

interface TrendsViewProps {
  onSelectClub: (clubId: string) => void;
}

export const TrendsView: React.FC<TrendsViewProps> = ({ onSelectClub }) => {
  const [scatterMetric, setScatterMetric] = useState<'titles' | 'finals'>('titles');
  const [hoveredPoint, setHoveredPoint] = useState<{
    teamId: string;
    teamName: string;
    qfCount: number;
    metricVal: number;
    x: number;
    y: number;
  } | null>(null);

  const clubDeepRunStats = useMemo(() => {
    return CLUBS.map((club) => {
      const stats = getClubSummaryStats(club.id);
      return {
        club,
        stats,
      };
    }).sort((a, b) => b.stats.quarterfinals - a.stats.quarterfinals);
  }, []);

  const scatterData = useMemo(() => getLongevityVsPrimeData(), []);

  // Compute slight vertical offsets for clubs that share the exact same coordinates
  const processedScatterPoints = useMemo(() => {
    const coordMap = new Map<string, number>();

    return scatterData.map((d) => {
      const xVal = scatterMetric === 'titles' ? d.titlesCount : d.finalsCount;
      const key = `${xVal}-${d.qfCount}`;
      const index = coordMap.get(key) || 0;
      coordMap.set(key, index + 1);

      // Slight vertical offset (+/- 0.4 on QF count) if overlapping
      let offsetY = 0;
      if (index === 1) offsetY = 0.4;
      else if (index === 2) offsetY = -0.4;

      return {
        ...d,
        xVal,
        adjustedQf: d.qfCount + offsetY,
      };
    });
  }, [scatterData, scatterMetric]);

  // Chart coordinate constants for viewBox 650 x 480
  const plotLeft = 65;
  const plotRight = 620;
  const plotTop = 25;
  const plotBottom = 425;
  const plotWidth = plotRight - plotLeft; // 555
  const plotHeight = plotBottom - plotTop; // 400

  // Conversion functions
  const getX = (val: number) => plotLeft + (val / 10) * plotWidth;
  const getY = (qf: number) => plotBottom - (qf / 25) * plotHeight;

  return (
    <div className="h-full flex-1 min-h-0 flex flex-col">
      {/* 2-Column Side-by-Side Layout: 5 cols Deep Runs, 7 cols Scatter Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1 min-h-0">
        {/* LEFT COLUMN: 5/12 Width - Deep Runs (QF+) */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-4 shadow-card flex flex-col h-full min-h-0">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 shrink-0">
            <div>
              <div className="flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                  Deep Runs (QF+)
                </h3>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Sorted by QF+ appearances (1996 to 2026)
              </p>
            </div>
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
              14 Clubs
            </span>
          </div>

          {/* Scrollable Club List */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 py-2 space-y-1.5 scrollbar-thin">
            {clubDeepRunStats.map(({ club, stats }, idx) => {
              const maxQf = 31;
              const qfWidthPercent = (stats.quarterfinals / maxQf) * 100;
              const sfWidthPercent = (stats.semifinals / maxQf) * 100;
              const finalWidthPercent = (stats.finals / maxQf) * 100;
              const titleWidthPercent = (stats.titles / maxQf) * 100;

              return (
                <div
                  key={club.id}
                  onClick={() => onSelectClub(club.id)}
                  title={`View ${club.name} UCL Journey`}
                  className="px-2.5 py-1.5 rounded-lg bg-gray-50/70 border border-gray-200 hover:border-gray-300 hover:bg-gray-100/70 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 w-3 shrink-0">
                        {idx + 1}
                      </span>
                      <img
                        src={`${import.meta.env.BASE_URL}crests/${club.id}.png`}
                        alt=""
                        className="w-4 h-4 object-contain shrink-0"
                      />
                      <span className="font-bold text-xs text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {club.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-[11px] shrink-0">
                      <span className="text-blue-600 font-bold">
                        {stats.quarterfinals} QF+
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-amber-600 font-bold">
                        {stats.titles} {stats.titles === 1 ? 'Title' : 'Titles'}
                      </span>
                    </div>
                  </div>

                  {/* Visual stacked distribution bar */}
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden flex relative">
                    <div
                      className="h-full bg-purple-200"
                      style={{ width: `${qfWidthPercent}%` }}
                    />
                    <div
                      className="h-full bg-blue-600 absolute left-0"
                      style={{ width: `${sfWidthPercent}%` }}
                    />
                    <div
                      className="h-full bg-slate-600 absolute left-0"
                      style={{ width: `${finalWidthPercent}%` }}
                    />
                    <div
                      className="h-full bg-amber-500 absolute left-0"
                      style={{ width: `${titleWidthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend Footer */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 shrink-0">
            <span className="flex items-center gap-1 font-medium text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Titles
            </span>
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-slate-600" /> Finals
            </span>
            <span className="flex items-center gap-1 font-medium text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-600" /> SF
            </span>
            <span className="flex items-center gap-1 font-medium text-purple-600">
              <span className="w-2 h-2 rounded-full bg-purple-200" /> QF
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: 7/12 Width - Deep-Run Longevity vs. Trophies (Scatter Plot) */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-4 shadow-card flex flex-col h-full min-h-0 relative">
          {/* Header with Title and Metric Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-gray-100 shrink-0">
            <div>
              <div className="flex items-center space-x-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                  Deep-Run Longevity vs. Trophies
                </h3>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                X: {scatterMetric === 'titles' ? 'Titles won' : 'Finals reached'} · Y: Total QF+ appearances (1996 to 2026)
              </p>
            </div>

            {/* Toggle metric buttons */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-0.5 text-xs self-start sm:self-center">
              <button
                onClick={() => setScatterMetric('titles')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  scatterMetric === 'titles'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Titles Won
              </button>
              <button
                onClick={() => setScatterMetric('finals')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  scatterMetric === 'finals'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Finals Reached
              </button>
            </div>
          </div>

          {/* SVG Scatter Plot Container - Full Space Utilization */}
          <div className="flex-1 min-h-0 w-full relative flex items-center justify-center p-1 overflow-hidden">
            <svg
              viewBox="0 0 650 480"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full select-none"
            >
              {/* Horizontal Grid Lines (Y-axis: QF+ appearances 0 to 25) */}
              {[0, 5, 10, 15, 20, 25].map((val) => {
                const y = getY(val);
                return (
                  <g key={`h-${val}`}>
                    <line
                      x1={plotLeft}
                      x2={plotRight}
                      y1={y}
                      y2={y}
                      stroke="#E5E7EB"
                      strokeWidth={1}
                      strokeDasharray="3, 3"
                    />
                    <text
                      x={plotLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[11px] font-semibold fill-gray-400"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Vertical Grid Lines (X-axis: Titles or Finals 0 to 10) */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                const x = getX(val);
                return (
                  <g key={`v-${val}`}>
                    <line
                      x1={x}
                      x2={x}
                      y1={plotTop}
                      y2={plotBottom}
                      stroke="#E5E7EB"
                      strokeWidth={1}
                      strokeDasharray="3, 3"
                    />
                    <line
                      x1={x}
                      x2={x}
                      y1={plotBottom}
                      y2={plotBottom + 5}
                      stroke="#9CA3AF"
                      strokeWidth={1.5}
                    />
                    <text
                      x={x}
                      y={plotBottom + 18}
                      textAnchor="middle"
                      className="text-[11px] font-semibold fill-gray-500"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Solid Base Axes */}
              <line
                x1={plotLeft}
                x2={plotRight}
                y1={plotBottom}
                y2={plotBottom}
                stroke="#9CA3AF"
                strokeWidth={1.5}
              />
              <line
                x1={plotLeft}
                x2={plotLeft}
                y1={plotTop}
                y2={plotBottom}
                stroke="#9CA3AF"
                strokeWidth={1.5}
              />

              {/* Benchmark Reference Line (1 title per 4 QF appearances, or 25% conversion) */}
              {scatterMetric === 'titles' && (
                <g>
                  <line
                    x1={getX(0)}
                    y1={getY(0)}
                    x2={getX(6.25)}
                    y2={getY(25)}
                    stroke="#CBD5E1"
                    strokeWidth={1.2}
                    strokeDasharray="4, 4"
                  />
                  <text
                    x={getX(6.25) + 6}
                    y={getY(25) + 4}
                    textAnchor="start"
                    className="text-[10px] font-medium fill-gray-400"
                  >
                    25% conversion benchmark
                  </text>
                </g>
              )}

              {/* Scatter Points (Badges with Logos) */}
              {processedScatterPoints.map((d) => {
                const cx = getX(d.xVal);
                const cy = getY(d.adjustedQf);
                const club = CLUB_MAP.get(d.teamId);
                const clubColor = club?.color || '#1D4ED8';
                const isHovered = hoveredPoint?.teamId === d.teamId;

                return (
                  <g
                    key={d.teamId}
                    className="cursor-pointer transition-all"
                    onClick={() => onSelectClub(d.teamId)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredPoint({
                        teamId: d.teamId,
                        teamName: d.teamName,
                        qfCount: d.qfCount,
                        metricVal: d.xVal,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Pulse Glow when hovered */}
                    {isHovered && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={18}
                        fill={clubColor}
                        fillOpacity={0.15}
                      />
                    )}

                    {/* Circular Background Badge */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={13}
                      fill="#FFFFFF"
                      stroke={isHovered ? '#111827' : clubColor}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="shadow-xs"
                    />

                    {/* Club Crest inside badge */}
                    <image
                      href={`${import.meta.env.BASE_URL}crests/${d.teamId}.png`}
                      x={cx - 9}
                      y={cy - 9}
                      width={18}
                      height={18}
                      preserveAspectRatio="xMidYMid meet"
                    />
                  </g>
                );
              })}

              {/* X-Axis Title */}
              <text
                x={(plotLeft + plotRight) / 2}
                y={plotBottom + 40}
                textAnchor="middle"
                className="text-xs font-semibold fill-gray-700"
              >
                {scatterMetric === 'titles' ? 'Titles Won (1996 to 2026)' : 'Finals Reached (1996 to 2026)'}
              </text>

              {/* Y-Axis Title */}
              <text
                x={-(plotTop + plotBottom) / 2}
                y={20}
                textAnchor="middle"
                transform="rotate(-90)"
                className="text-xs font-semibold fill-gray-700"
              >
                Total QF+ Appearances (1996 to 2026)
              </text>
            </svg>
          </div>

          {/* Footer Insight */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 shrink-0">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-gray-400" />
              <span>Real Madrid: 9 titles from 22 deep runs (41% title conversion rate)</span>
            </span>
            <span className="text-gray-400 hidden sm:inline">
              Click any club badge to view Journey
            </span>
          </div>

          {/* Floating Tooltip */}
          {hoveredPoint && (
            <div
              className="fixed z-50 pointer-events-none p-2.5 rounded-lg bg-gray-900 text-white shadow-xl text-xs -translate-x-1/2 -translate-y-full"
              style={{
                left: hoveredPoint.x,
                top: hoveredPoint.y - 10,
                minWidth: 150,
              }}
            >
              <div className="flex items-center gap-2 border-b border-gray-700 pb-1 mb-1">
                <img
                  src={`${import.meta.env.BASE_URL}crests/${hoveredPoint.teamId}.png`}
                  alt=""
                  className="w-4 h-4 object-contain"
                />
                <span className="font-bold text-white truncate">{hoveredPoint.teamName}</span>
              </div>
              <div className="space-y-1 text-gray-300 text-[11px]">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">
                    {scatterMetric === 'titles' ? 'Titles Won:' : 'Finals Reached:'}
                  </span>
                  <span className="font-bold text-amber-400">{hoveredPoint.metricVal}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Deep Runs (QF+):</span>
                  <span className="font-bold text-white">{hoveredPoint.qfCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
