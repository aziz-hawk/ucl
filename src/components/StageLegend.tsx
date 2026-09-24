import React from 'react';
import { STAGE_ORDER, STAGE_DEFINITIONS } from '../lib/stages';

interface StageLegendProps {
  className?: string;
  compact?: boolean;
}

export const StageLegend: React.FC<StageLegendProps> = ({ className = '', compact = false }) => {
  return (
    <div className={`bg-gray-50/70 border border-gray-200 rounded-lg p-3 text-xs ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {STAGE_ORDER.map((stageKey) => {
          const def = STAGE_DEFINITIONS[stageKey];
          return (
            <div
              key={stageKey}
              className="flex items-center space-x-2 py-0.5"
            >
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center font-bold text-[8px] text-white"
                style={{ backgroundColor: def.color }}
              >
                {def.shortLabel.length <= 2 ? def.shortLabel : ''}
              </div>
              <span className="text-gray-700 font-medium text-xs truncate">
                {compact ? def.shortLabel : def.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
