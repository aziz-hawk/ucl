import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ClubSelector } from './components/ClubSelector';
import { UclJourney } from './components/UclJourney';
import { UclHeatmap } from './components/UclHeatmap';
import { PrimePanel } from './components/PrimePanel';
import { ComparisonView } from './components/ComparisonView';
import { TrendsView } from './components/TrendsView';
import { FinalsView } from './components/FinalsView';
import { SeasonExplorer } from './components/SeasonExplorer';
import { DataSourcesView } from './components/DataSourcesView';
import { SeasonDetailModal } from './components/SeasonDetailModal';
import { ClubSeasonRecord } from './types/ucl';
import { CLUBS } from './data/clubs';
import { getClubSeasons } from './lib/analytics';
import { ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  const getInitialState = () => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as ActiveTab | null;
    const teamParam = params.get('team');

    const validTabs: ActiveTab[] = ['heatmap', 'journey', 'prime', 'compare', 'trends', 'finals', 'seasons', 'data'];
    const activeTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'journey';
    const selectedClubId = teamParam && CLUBS.some(c => c.id === teamParam) ? teamParam : 'bayern';

    return { activeTab, selectedClubId };
  };

  const initial = getInitialState();
  const [activeTab, setActiveTab] = useState<ActiveTab>(initial.activeTab);
  const [selectedClubId, setSelectedClubId] = useState<string>(initial.selectedClubId);
  const [selectedRecord, setSelectedRecord] = useState<ClubSeasonRecord | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', activeTab);
    if (activeTab === 'journey' || activeTab === 'prime') {
      params.set('team', selectedClubId);
    } else {
      params.delete('team');
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [activeTab, selectedClubId]);

  const handleNavigateModalSeason = (delta: number) => {
    if (!selectedRecord) return;
    const targetYear = selectedRecord.seasonEndYear + delta;
    if (targetYear < 1996 || targetYear > 2026) return;

    const teamRecords = getClubSeasons(selectedRecord.teamId);
    const targetRecord = teamRecords.find((r) => r.seasonEndYear === targetYear);
    if (targetRecord) {
      setSelectedRecord(targetRecord);
    }
  };

  const handleSelectClubAndSwitchToJourney = (clubId: string) => {
    setSelectedClubId(clubId);
    setActiveTab('journey');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 flex flex-col font-sans">
      {/* Top Application Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main
        className={
          activeTab === 'trends'
            ? 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 h-[calc(100vh-101px)] overflow-hidden flex flex-col'
            : 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5'
        }
      >
        {/* Club Quick Selector for Journey and Prime views */}
        {(activeTab === 'journey' || activeTab === 'prime') && (
          <ClubSelector
            selectedClubId={selectedClubId}
            onSelectClub={setSelectedClubId}
          />
        )}

        {/* Tab Views */}
        {activeTab === 'journey' && (
          <UclJourney
            selectedClubId={selectedClubId}
            onSelectSeason={(record) => setSelectedRecord(record)}
            onExplorePrime={() => setActiveTab('prime')}
            onCompareClubs={() => setActiveTab('compare')}
          />
        )}

        {activeTab === 'heatmap' && (
          <UclHeatmap
            onSelectSeasonRecord={(record) => setSelectedRecord(record)}
            onSelectClub={handleSelectClubAndSwitchToJourney}
          />
        )}

        {activeTab === 'prime' && (
          <PrimePanel
            selectedClubId={selectedClubId}
            onSelectSeasonRecord={(record) => setSelectedRecord(record)}
          />
        )}

        {activeTab === 'compare' && (
          <ComparisonView
            onSelectSeasonRecord={(record) => setSelectedRecord(record)}
          />
        )}

        {activeTab === 'trends' && (
          <TrendsView
            onSelectClub={handleSelectClubAndSwitchToJourney}
          />
        )}

        {activeTab === 'finals' && (
          <FinalsView
            onSelectClub={handleSelectClubAndSwitchToJourney}
            onSelectSeasonRecord={(record) => setSelectedRecord(record)}
          />
        )}

        {activeTab === 'seasons' && (
          <SeasonExplorer
            onSelectSeasonRecord={(record) => setSelectedRecord(record)}
            onSelectClub={handleSelectClubAndSwitchToJourney}
          />
        )}

        {activeTab === 'data' && (
          <DataSourcesView
            onSelectRecord={(record) => setSelectedRecord(record)}
          />
        )}
      </main>

      {/* Season Detail Modal */}
      <SeasonDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onNavigateSeason={handleNavigateModalSeason}
      />

      {/* Clean FotMob Style Footer (Hidden on Trends view so it fits on a single screen without scrolling) */}
      {activeTab !== 'trends' && (
        <footer className="mt-12 bg-white border-t border-gray-200 py-6 text-xs text-gray-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-700">UEFA Champions League History</span>
              <span>·</span>
              <span>1995/96 to 2025/26</span>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="https://www.rsssf.org/ec/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 flex items-center gap-1 transition-colors"
              >
                <span>RSSSF Archive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://www.uefa.com/uefachampionsleague/history/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 flex items-center gap-1 transition-colors"
              >
                <span>UEFA Official</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
