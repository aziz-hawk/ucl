import React, { useState, useMemo } from 'react';
import { ClubSeasonRecord } from '../types/ucl';
import { SEASONS, SEASON_MAP } from '../data/seasons';
import { CLUB_MAP } from '../data/clubs';
import { getSeasonSnapshot } from '../lib/analytics';
import { getStageDef } from '../lib/stages';
import { Trophy, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';

interface SeasonExplorerProps {
  onSelectSeasonRecord: (record: ClubSeasonRecord) => void;
  onSelectClub: (clubId: string) => void;
}

export const SeasonExplorer: React.FC<SeasonExplorerProps> = ({
  onSelectSeasonRecord,
  onSelectClub
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2012);

  const seasonInfo = useMemo(() => SEASON_MAP.get(selectedYear), [selectedYear]);
  const records = useMemo(() => getSeasonSnapshot(selectedYear), [selectedYear]);

  const changeSeason = (delta: number) => {
    const nextYear = selectedYear + delta;
    if (nextYear >= 1996 && nextYear <= 2026) {
      setSelectedYear(nextYear);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Season Navigation */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Season {seasonInfo?.seasonLabel} ({selectedYear})
          </h2>
          {seasonInfo?.finalVenue && (
            <p className="text-xs text-gray-500 mt-0.5">
              Final venue: {seasonInfo.finalVenue}
            </p>
          )}
        </div>

        {/* Season Stepper & Dropdown */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => changeSeason(-1)}
            disabled={selectedYear <= 1996}
            className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous Season"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-gray-400 cursor-pointer"
          >
            {[...SEASONS].reverse().map((s) => (
              <option key={s.seasonEndYear} value={s.seasonEndYear}>
                {s.seasonLabel} ({s.seasonEndYear})
              </option>
            ))}
          </select>

          <button
            onClick={() => changeSeason(1)}
            disabled={selectedYear >= 2026}
            className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next Season"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 13 Clubs Outcomes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {records.map((rec) => {
          const club = CLUB_MAP.get(rec.teamId);
          const stageDef = getStageDef(rec.normalizedStage);

          return (
            <div
              key={rec.teamId}
              onClick={() => onSelectSeasonRecord(rec)}
              className="p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 cursor-pointer transition-all flex flex-col justify-between space-y-3 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <img
                    src={`${import.meta.env.BASE_URL}crests/${rec.teamId}.png`}
                    alt=""
                    className="w-7 h-7 object-contain shrink-0"
                  />
                  <div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClub(rec.teamId);
                      }}
                      className="font-bold text-sm text-gray-900 hover:text-blue-600 transition-colors text-left"
                    >
                      {rec.teamName}
                    </button>
                    <span className="text-xs text-gray-400 block">{club?.country}</span>
                  </div>
                </div>

                <div
                  className="px-2.5 py-0.5 rounded text-xs font-bold flex items-center gap-1"
                  style={{
                    backgroundColor: stageDef.badgeBg,
                    color: stageDef.color,
                  }}
                >
                  {rec.won && <Trophy className="w-3 h-3 text-amber-500" />}
                  <span>{stageDef.label}</span>
                </div>
              </div>

              {/* Status & Details */}
              <div className="text-xs text-gray-600 pt-2 border-t border-gray-100">
                {rec.participated ? (
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Stage:</span>
                      <span className="text-gray-800 font-semibold">{rec.exactStage}</span>
                    </div>
                    {rec.reachedFinal && rec.finalOpponent && (
                      <div className="text-amber-600 text-xs font-medium pt-0.5">
                        Final vs {rec.finalOpponent} ({rec.finalResult})
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-gray-300" />
                    Did not participate
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
