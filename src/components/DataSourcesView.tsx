import React, { useState, useMemo } from 'react';
import { ClubSeasonRecord } from '../types/ucl';
import uclResultsRaw from '../data/uclResults.json';
import { CLUBS } from '../data/clubs';
import { getStageDef } from '../lib/stages';
import { Download, Search } from 'lucide-react';

const allRecords: ClubSeasonRecord[] = uclResultsRaw as ClubSeasonRecord[];

interface DataSourcesViewProps {
  onSelectRecord?: (record: ClubSeasonRecord) => void;
}

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({ onSelectRecord }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [participatedOnly, setParticipatedOnly] = useState(false);

  const filteredRecords = useMemo(() => {
    return allRecords.filter((rec) => {
      if (teamFilter !== 'all' && rec.teamId !== teamFilter) return false;
      if (participatedOnly && !rec.participated) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchName = rec.teamName.toLowerCase().includes(term);
        const matchSeason = rec.seasonLabel.toLowerCase().includes(term);
        const matchStage = rec.exactStage.toLowerCase().includes(term);
        return matchName || matchSeason || matchStage;
      }
      return true;
    });
  }, [searchTerm, teamFilter, participatedOnly]);

  const handleExportCSV = () => {
    const headers = [
      'teamId', 'teamName', 'seasonEndYear', 'seasonLabel', 'axisLabel',
      'participated', 'normalizedStage', 'exactStage', 'stageRank',
      'reachedRoundOf16', 'reachedQuarterFinal', 'reachedSemiFinal', 'reachedFinal',
      'won', 'finalOpponent', 'finalResult'
    ];

    const rows = allRecords.map((r) => [
      r.teamId,
      `"${r.teamName}"`,
      r.seasonEndYear,
      `"${r.seasonLabel}"`,
      `"${r.axisLabel}"`,
      r.participated,
      r.normalizedStage,
      `"${r.exactStage}"`,
      r.stageRank,
      r.reachedRoundOf16,
      r.reachedQuarterFinal,
      r.reachedSemiFinal,
      r.reachedFinal,
      r.won,
      `"${r.finalOpponent || ''}"`,
      `"${r.finalResult || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ucl_history_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Historical Dataset
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              434 records across 14 clubs and 31 seasons (1995/96 to 2025/26)
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold shadow-xs transition-colors self-start md:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search club, season, or stage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
            />
          </div>

          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-800 focus:outline-none focus:border-gray-400 cursor-pointer"
          >
            <option value="all">All 14 Clubs</option>
            {CLUBS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="flex items-center space-x-2 text-xs text-gray-600 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={participatedOnly}
              onChange={(e) => setParticipatedOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-0"
            />
            <span>Participated Only</span>
          </label>
        </div>
      </div>

      {/* Dataset Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Season</th>
                <th className="py-3 px-4">Club</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Official Stage</th>
                <th className="py-3 px-4">Final Tie</th>
                <th className="py-3 px-4 text-center">QF+</th>
                <th className="py-3 px-4 text-center">Won</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.slice(0, 100).map((r, idx) => {
                const stageDef = getStageDef(r.normalizedStage);

                return (
                  <tr
                    key={`${r.teamId}-${r.seasonEndYear}-${idx}`}
                    onClick={() => onSelectRecord && onSelectRecord(r)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 font-semibold text-gray-900">
                      {r.seasonLabel}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center space-x-2">
                        <img
                          src={`${import.meta.env.BASE_URL}crests/${r.teamId}.png`}
                          alt=""
                          className="w-4 h-4 object-contain shrink-0"
                        />
                        <span className="font-medium text-gray-800">{r.teamName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      {r.participated ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold">
                          Participated
                        </span>
                      ) : (
                        <span className="text-gray-400 bg-gray-100 px-2 py-0.5 rounded text-[10px]">
                          Did not play
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          backgroundColor: stageDef.badgeBg,
                          color: stageDef.color,
                        }}
                      >
                        {r.exactStage}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-600">
                      {r.finalOpponent ? (
                        <span>
                          vs {r.finalOpponent} <strong className="text-gray-900">({r.finalResult})</strong>
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold">
                      {r.reachedQuarterFinal ? (
                        <span className="text-blue-600">✓</span>
                      ) : (
                        <span className="text-gray-200">·</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {r.won ? (
                        <span className="text-amber-500 font-bold">★</span>
                      ) : (
                        <span className="text-gray-200">·</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRecords.length > 100 && (
          <div className="p-3 text-center text-xs text-gray-400 border-t border-gray-100 bg-gray-50/50">
            Showing first 100 of {filteredRecords.length} records. Export CSV for the complete dataset.
          </div>
        )}
      </div>
    </div>
  );
};
