import React, { useMemo } from 'react';
import { ClubSeasonRecord } from '../types/ucl';
import { getPeakSeasons, getGoldenEras, getLongestStreaks } from '../lib/analytics';
import { CLUB_MAP } from '../data/clubs';
import { getStageDef } from '../lib/stages';
import { Trophy, Calendar } from 'lucide-react';

interface PrimePanelProps {
  selectedClubId: string;
  onSelectSeasonRecord?: (record: ClubSeasonRecord) => void;
}

export const PrimePanel: React.FC<PrimePanelProps> = ({
  selectedClubId,
  onSelectSeasonRecord
}) => {
  const club = CLUB_MAP.get(selectedClubId);

  const peakSeasons = useMemo(() => getPeakSeasons(selectedClubId), [selectedClubId]);
  const goldenEras = useMemo(() => getGoldenEras(selectedClubId), [selectedClubId]);
  const streaks = useMemo(() => getLongestStreaks(selectedClubId), [selectedClubId]);

  return (
    <div className="space-y-6">
      {/* Section 1: Golden Eras (Variable-Length, Strictly Non-Overlapping) */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {club?.name} Golden Eras
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 self-start sm:self-auto">
            {goldenEras.length} Distinct Era{goldenEras.length !== 1 ? 's' : ''} Identified
          </span>
        </div>

        {/* Golden Era Cards */}
        {goldenEras.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {goldenEras.map((era, idx) => (
              <div
                key={era.id}
                className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-gray-300 transition-colors"
              >
                <div>
                  {/* Era Title & Timeframe */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                        Era {idx + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900">
                        {era.name}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-gray-900 px-2.5 py-0.5 rounded-md bg-white border border-gray-200">
                      {era.startSeason} to {era.endSeason} ({era.duration} seasons)
                    </span>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2 my-3.5 text-center">
                    <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                      <span className="text-[10px] uppercase text-gray-400 font-semibold block">Titles</span>
                      <span className="text-base sm:text-lg font-bold text-amber-500 flex items-center justify-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        {era.titles}
                      </span>
                      <span className="text-[10px] text-gray-400 block">won</span>
                    </div>

                    <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                      <span className="text-[10px] uppercase text-gray-400 font-semibold block">Finals</span>
                      <span className="text-base sm:text-lg font-bold text-gray-800">
                        {era.finals}
                      </span>
                      <span className="text-[10px] text-gray-400 block">finals</span>
                    </div>

                    <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                      <span className="text-[10px] uppercase text-gray-400 font-semibold block">Semi-Finals</span>
                      <span className="text-base sm:text-lg font-bold text-purple-600">
                        {era.semiFinals}
                      </span>
                      <span className="text-[10px] text-gray-400 block">reached</span>
                    </div>

                    <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                      <span className="text-[10px] uppercase text-gray-400 font-semibold block">QF+ Rate</span>
                      <span className="text-base sm:text-lg font-bold text-blue-600">
                        {era.qfPlusRate.toFixed(0)}%
                      </span>
                      <span className="text-[10px] text-gray-400 block">{era.quarterFinals}/{era.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Season Ribbon */}
                <div className="pt-3 border-t border-gray-200/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-gray-400 font-medium mr-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    Seasons:
                  </span>
                  {era.seasons.map((s) => {
                    const sDef = getStageDef(s.normalizedStage);
                    return (
                      <button
                        key={s.seasonEndYear}
                        onClick={() => onSelectSeasonRecord && onSelectSeasonRecord(s)}
                        className="px-2 py-0.5 rounded text-xs font-semibold border bg-white hover:bg-gray-50 transition-colors"
                        style={{
                          color: sDef.color,
                          borderColor: '#E5E7EB'
                        }}
                        title={`${s.seasonLabel}: ${sDef.longLabel}`}
                      >
                        <span>{s.axisLabel}</span>
                        <span className="ml-1">{s.won ? '★' : sDef.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            No distinct multi-season Golden Era recorded for this club.
          </div>
        )}
      </div>

      {/* Section 2: Dedicated Peak Campaigns (Separated from Prime) */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-card">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              Peak Campaigns
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            {peakSeasons.length} Pinnacle Campaign{peakSeasons.length !== 1 ? 's' : ''}
          </span>
        </div>

        {peakSeasons.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {peakSeasons.map((p) => {
              const pDef = getStageDef(p.normalizedStage);
              return (
                <div
                  key={p.seasonEndYear}
                  onClick={() => onSelectSeasonRecord && onSelectSeasonRecord(p)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/70 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-900 shadow-xs">
                      {p.axisLabel}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">
                        {p.seasonLabel}
                      </div>
                      {p.finalOpponent && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          vs {p.finalOpponent} {p.finalResult && `(${p.finalResult})`}
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-bold shrink-0"
                    style={{ backgroundColor: pDef.badgeBg, color: pDef.color }}
                  >
                    {pDef.label} {p.won && '★'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            No European finals reached during this 31-season period.
          </div>
        )}
      </div>

      {/* Section 3: Sustained Streaks */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-card">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              Sustained Streaks
            </h3>
          </div>
          <span className="text-xs text-gray-400 font-medium">1996 to 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(streaks).map(([key, streak]) => {
            const isQf = key === 'qf';
            const isTitle = key === 'title';

            return (
              <div
                key={key}
                className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70"
              >
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="font-semibold text-gray-700">{streak.label}</span>
                  {streak.active && (
                    <span className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="flex items-baseline space-x-2 mt-2">
                  <span className={`text-2xl font-bold ${
                    isTitle ? 'text-amber-500' : isQf ? 'text-purple-600' : 'text-blue-600'
                  }`}>
                    {streak.length}
                  </span>
                  <span className="text-xs text-gray-500">
                    consecutive seasons
                  </span>
                </div>

                <div className="text-xs text-gray-400 mt-1">
                  {streak.startSeason && streak.endSeason ? (
                    <span>{streak.startSeason} to {streak.endSeason}</span>
                  ) : (
                    <span>No streak recorded</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
