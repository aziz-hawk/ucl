import React from 'react';
import { CLUBS } from '../data/clubs';

interface ClubSelectorProps {
  selectedClubId: string;
  onSelectClub: (clubId: string) => void;
  className?: string;
}

export const ClubSelector: React.FC<ClubSelectorProps> = ({
  selectedClubId,
  onSelectClub,
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 w-full">
        {CLUBS.map((club) => {
          const isSelected = club.id === selectedClubId;
          return (
            <button
              key={club.id}
              onClick={() => onSelectClub(club.id)}
              className={`flex items-center justify-center space-x-2 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all w-full min-w-0 ${
                isSelected
                  ? 'bg-gray-900 text-white shadow-xs font-semibold'
                  : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
              }`}
            >
              <img
                src={`${import.meta.env.BASE_URL}crests/${club.id}.png`}
                alt=""
                className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain shrink-0"
              />
              <span className="truncate">{club.shortName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
