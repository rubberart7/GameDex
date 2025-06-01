import React from 'react';

export interface Platform {
  id: number;
  name: string;
}

export interface PlatformObj {
  platform: Platform;
}

export interface Game {
  background_image: string;
  name: string;
  rating: number;
  platforms: PlatformObj[]; // still needed in the type for type safety
  parent_platforms: PlatformObj[];
  released: string;
}

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-xs">
      <img
        src={game.background_image}
        alt={game.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">{game.name}</h2>
          <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
            {game.rating.toFixed(1)}
          </span>
        </div>

        {/* Parent Platforms */}
        <div className="flex flex-wrap gap-1 mb-2">
          {game.parent_platforms.map((platformObj) => (
            <span
              key={`parent-${platformObj.platform.id}`}
              className="bg-blue-200 rounded px-2 py-0.5 text-xs"
            >
              {platformObj.platform.name}
            </span>
          ))}
        </div>

        {/* Released date */}
        <div className="flex justify-end text-gray-600 text-sm mt-2">
          <span>{game.released}</span>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
