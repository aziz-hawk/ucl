import React from 'react';
import { ClubSeasonRecord } from '../types/ucl';
import { getStageDef } from '../lib/stages';
import { CLUB_MAP } from '../data/clubs';
import { SEASON_MAP } from '../data/seasons';
import { X, Trophy, ExternalLink, Calendar, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface SeasonDetailModalProps {
  record: ClubSeasonRecord | null;
  onClose: () => void;
  onNavigateSeason?: (step: number) => void;
}

export const SeasonDetailModal: React.FC<SeasonDetailModalProps> = ({
  record,
  onClose,
  onNavigateSeason
}) => {
  if (!record) return null;

  const stageDef = getStageDef(record.normalizedStage);
  const club = CLUB_MAP.get(record.teamId);
  const season = SEASON_MAP.get(record.seasonEndYear);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="season-detail-title"
    >
      <div className="bg-white border border-gray-200 rounded-xl w-full max-w-lg overflow-hidden shadow-dropdown transition-all">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={`${import.meta.env.BASE_URL}crests/${record.teamId}.png`}
              alt=""
              className="w-10 h-10 object-contain shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 id="season-detail-title" className="text-lg font-bold text-gray-900">
                  {record.teamName}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold">
                  {record.seasonLabel}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {club?.country} · {record.seasonEndYear} Season
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {onNavigateSeason && (
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5 mr-2">
                <button
                  onClick={() => onNavigateSeason(-1)}
                  disabled={record.seasonEndYear <= 1996}
                  className="p-1 rounded text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors"
                  title="Previous Season"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigateSeason(1)}
                  disabled={record.seasonEndYear >= 2026}
                  className="p-1 rounded text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors"
                  title="Next Season"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Stage Result Banner */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between gap-3"
            style={{
              backgroundColor: stageDef.badgeBg,
              borderColor: `${stageDef.color}30`
            }}
          >
            <div>
              <span className="text-xs uppercase text-gray-500 font-semibold block mb-0.5">
                Finishing Stage
              </span>
              <div className="text-xl font-bold flex items-center gap-1.5" style={{ color: stageDef.color }}>
                {record.won && <Trophy className="w-5 h-5 text-amber-500" />}
                <span>{stageDef.longLabel}</span>
              </div>
            </div>
            <div className="text-right">
              {record.participated ? (
                <span className="text-emerald-700 bg-white/80 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Main Draw
                </span>
              ) : (
                <span className="text-gray-500 text-xs">No Participation</span>
              )}
            </div>
          </div>

          {/* Finals Outcome (if reached final) */}
          {record.reachedFinal && record.finalOpponent && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold mb-2">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>UCL Final</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                <span>{record.teamName}</span>
                <span className="px-2.5 py-0.5 bg-white text-amber-700 rounded-md text-xs font-bold border border-amber-300 shadow-2xs">
                  {record.finalResult || (record.won ? 'Champions' : 'Finalist')}
                </span>
                <span>{record.finalOpponent}</span>
              </div>
              {season?.finalVenue && (
                <div className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Venue: {season.finalVenue}</span>
                </div>
              )}
            </div>
          )}

          {/* Knockout Path Details (if available) */}
          {record.knockoutPath && record.knockoutPath.length > 0 && (
            <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-4">
              <h4 className="text-xs uppercase text-gray-500 font-bold mb-2.5">
                Knockout Rounds
              </h4>
              <div className="space-y-1.5">
                {record.knockoutPath.map((tie, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-12 text-[10px] uppercase font-bold text-gray-500">
                        {tie.round === 'round_of_16' ? 'R16' : tie.round === 'quarter_final' ? 'QF' : tie.round === 'semi_final' ? 'SF' : 'Final'}
                      </span>
                      <span className="text-gray-900 font-medium">vs {tie.opponent}</span>
                    </div>
                    <div>
                      {tie.aggregate && (
                        <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                          {tie.aggregate}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {record.sources && record.sources.length > 0 && (
            <div className="pt-2">
              <div className="flex flex-wrap gap-2 text-xs">
                {record.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200 transition-colors text-[11px]"
                  >
                    <span className="font-semibold text-blue-600">{src.provider}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition-colors focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
