import React from 'react';

export type ActiveTab = 'heatmap' | 'journey' | 'prime' | 'compare' | 'trends' | 'finals' | 'seasons' | 'data';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'journey', label: 'Journey' },
    { id: 'prime', label: 'Golden Eras' },
    { id: 'compare', label: 'Compare' },
    { id: 'trends', label: 'Trends' },
    { id: 'finals', label: 'Finals' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Bar */}
        <div className="flex items-center justify-between h-14 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#060c24] flex items-center justify-center p-1.5 shadow-xs border border-blue-950">
              <img src={`${import.meta.env.BASE_URL}ucl-starball-white.svg`} alt="UCL Starball" className="w-5 h-5 object-contain" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-bold text-gray-900 text-lg tracking-tight">UCL History</span>
              <span className="text-xs text-gray-400 font-medium">1996 to 2026</span>
            </div>
          </div>
        </div>

        {/* FotMob Style Tab Bar with Active Bottom Indicator */}
        <nav className="flex space-x-6 sm:space-x-8 overflow-x-auto scrollbar-none pt-2" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-gray-900 text-gray-900 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 font-medium'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
