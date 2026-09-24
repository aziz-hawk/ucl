import React, { useState, useMemo } from 'react';
import { ClubSeasonRecord } from '../types/ucl';
import { CLUBS } from '../data/clubs';
import { SEASONS } from '../data/seasons';
import { getClubSeasons } from '../lib/analytics';

interface UclHeatmapProps {
  onSelectSeasonRecord: (record: ClubSeasonRecord) => void;
  onSelectClub: (clubId: string) => void;
}

// Stage rank -> short label and opacity level (0 to 1)
const STAGE_CONFIG: Record<string, { label: string; opacity: number }> = {
  winner:              { label: 'W',   opacity: 1.0 },
  runner_up:           { label: 'F',   opacity: 0.78 },
  semi_final:          { label: 'SF',  opacity: 0.58 },
  quarter_final:       { label: 'QF',  opacity: 0.40 },
  round_of_16:         { label: 'R16', opacity: 0.26 },
  knockout_playoff:    { label: 'PO',  opacity: 0.18 },
  league_phase:        { label: 'LP',  opacity: 0.14 },
  group_phase:         { label: 'GS',  opacity: 0.12 },
  qualifying:          { label: 'Q',   opacity: 0.08 },
  did_not_participate: { label: 'D',   opacity: 0 },
};

// Filter options
type FilterMode = 'all' | 'qfPlus' | 'finals' | 'winners';

export const UclHeatmap: React.FC<UclHeatmapProps> = ({
  onSelectSeasonRecord,
  onSelectClub
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [hoveredCell, setHoveredCell] = useState<ClubSeasonRecord | null>(null);
  const [hoveredPos, setHoveredPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pre-build lookup: clubId + seasonEndYear -> record
  const recordsMap = useMemo(() => {
    const map = new Map<string, ClubSeasonRecord>();
    CLUBS.forEach((club) => {
      getClubSeasons(club.id).forEach((r) => {
        map.set(`${club.id}-${r.seasonEndYear}`, r);
      });
    });
    return map;
  }, []);

  const isDimmed = (rec: ClubSeasonRecord): boolean => {
    if (filterMode === 'qfPlus') return !rec.reachedQuarterFinal;
    if (filterMode === 'finals') return !rec.reachedFinal;
    if (filterMode === 'winners') return !rec.won;
    return false;
  };

  return (
    <div className="space-y-5">
      {/* Header & Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Season Heatmap</h2>
        </div>

        {/* Stage Filter */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 text-xs">
          {([
            { id: 'all',     label: 'All' },
            { id: 'qfPlus',  label: 'QF+' },
            { id: 'finals',  label: 'Finals' },
            { id: 'winners', label: '★ Champions' },
          ] as { id: FilterMode; label: string }[]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilterMode(id)}
              className={`px-3 py-1 rounded-md font-semibold transition-all whitespace-nowrap ${
                filterMode === id
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Matrix */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div style={{ minWidth: 900 }}>
          {/* Column Headers - Season Years */}
          <div className="flex">
            {/* Club label column spacer */}
            <div className="shrink-0" style={{ width: 120 }} />
            {SEASONS.map((s) => (
              <div
                key={s.seasonEndYear}
                className="text-center text-[10px] text-gray-400 font-medium pb-2"
                style={{ flex: 1, minWidth: 24 }}
              >
                {s.axisLabel}
              </div>
            ))}
          </div>

          {/* Club Rows */}
          <div className="space-y-1">
            {CLUBS.map((club) => {
              const clubColor = club.color;

              return (
                <div key={club.id} className="flex items-center group">
                  {/* Club Name */}
                  <button
                    onClick={() => onSelectClub(club.id)}
                    className="shrink-0 flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors text-left focus:outline-none pr-2"
                    style={{ width: 120 }}
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}crests/${club.id}.png`}
                      alt=""
                      className="w-4 h-4 object-contain shrink-0"
                    />
                    <span className="truncate">{club.shortName}</span>
                  </button>

                  {/* 31 Season Cells */}
                  {SEASONS.map((s) => {
                    const rec = recordsMap.get(`${club.id}-${s.seasonEndYear}`);
                    if (!rec) {
                      return (
                        <div
                          key={s.seasonEndYear}
                          className="rounded bg-gray-100"
                          style={{ flex: 1, minWidth: 24, height: 30, margin: '0 1px' }}
                        />
                      );
                    }

                    const cfg = STAGE_CONFIG[rec.normalizedStage] ?? STAGE_CONFIG['did_not_participate'];
                    const dimmed = isDimmed(rec);

                    // Background colour: club color at the stage opacity
                    const bgColor = rec.participated && cfg.opacity > 0
                      ? clubColor
                      : 'transparent';
                    const bgOpacity = dimmed ? cfg.opacity * 0.12 : cfg.opacity;

                    // Text: white on dark cells, transparent on D
                    const showLabel = rec.participated;
                    const textOpacity = dimmed ? 0.25 : (cfg.opacity > 0.3 ? 1 : 0.7);

                    return (
                      <div
                        key={s.seasonEndYear}
                        onClick={() => onSelectSeasonRecord(rec)}
                        onMouseEnter={(e) => {
                          setHoveredCell(rec);
                          const r = e.currentTarget.getBoundingClientRect();
                          setHoveredPos({ x: r.left + r.width / 2, y: r.top });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`relative flex items-center justify-center rounded cursor-pointer transition-all duration-100 select-none ${
                          !dimmed && rec.participated ? 'hover:ring-1 hover:ring-gray-400 hover:scale-105 hover:z-10' : ''
                        }`}
                        style={{
                          flex: 1,
                          minWidth: 24,
                          height: 30,
                          margin: '0 1px',
                          backgroundColor: rec.participated && cfg.opacity > 0
                            ? hexWithOpacity(bgColor, bgOpacity)
                            : dimmed ? '#F9FAFB' : '#F3F4F6',
                        }}
                        title={`${club.name} · ${s.seasonLabel} · ${rec.exactStage}`}
                      >
                        {showLabel && cfg.label !== 'D' && (
                          <span
                            className="text-[9px] font-bold leading-none"
                            style={{
                              color: cfg.opacity > 0.45 ? '#FFFFFF' : clubColor,
                              opacity: textOpacity,
                            }}
                          >
                            {cfg.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-5 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-5 gap-y-2">
            {[
              { label: 'W: Winner',          opacity: 1.0 },
              { label: 'F: Final',           opacity: 0.78 },
              { label: 'SF: Semi-final',     opacity: 0.58 },
              { label: 'QF: Quarter-final',  opacity: 0.40 },
              { label: 'R16: Round of 16',   opacity: 0.26 },
              { label: 'PO: Play-offs',      opacity: 0.18 },
              { label: 'GS: Group Stage',    opacity: 0.12 },
              { label: 'D: Did not play',    opacity: 0 },
            ].map(({ label, opacity }) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                <div
                  className="w-6 h-4 rounded"
                  style={{
                    backgroundColor: opacity > 0
                      ? hexWithOpacity('#1D4ED8', opacity)
                      : '#F3F4F6',
                    border: opacity === 0 ? '1px solid #E5E7EB' : 'none',
                  }}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none p-3 rounded-lg bg-gray-900 text-white shadow-xl text-xs -translate-x-1/2 -translate-y-full"
          style={{
            left: hoveredPos.x,
            top: hoveredPos.y - 10,
            minWidth: 160,
          }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-gray-700 pb-1.5 mb-1.5">
            <span className="font-bold">{hoveredCell.teamName}</span>
            <span className="text-gray-300">{hoveredCell.seasonLabel}</span>
          </div>
          <div className="text-gray-200 font-medium">{hoveredCell.exactStage}</div>
          {hoveredCell.reachedFinal && hoveredCell.finalOpponent && (
            <div className="text-amber-300 text-[11px] mt-1">
              Final vs {hoveredCell.finalOpponent}
              {hoveredCell.finalResult && ` (${hoveredCell.finalResult})`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/** Convert a hex color to an rgba string with the given opacity */
function hexWithOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
