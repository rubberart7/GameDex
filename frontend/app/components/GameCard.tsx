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
  platforms: PlatformObj[];
  parent_platforms: PlatformObj[];
  released: string;
}

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <div className="relative bg-slate-800 rounded-lg shadow-md overflow-hidden w-full min-h-[475px]">
      <img
        src={game.background_image}
        alt={game.name}
        className="w-full h-67 object-cover"
      />

      <div className="p-4">

        <div className="fullCard flex flex-col gap-1">

          <div className="top-card">
            <div className="flex justify-between items-center mb-2 gap-1.25">
              <h2 className="text-stone-300 text-lg font-semibold cursor-pointer line-clamp-2">
                {game.name}
              </h2>
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                {game.rating.toFixed(1)}
              </span>
            </div>

            <div className="flex flex-wrap gap-1 mb-2 mt-1">
              {game.parent_platforms.map((platformObj) => (
                <span
                  key={`parent-${platformObj.platform.id}`}
                  className="bg-blue-200 rounded px-2 py-0.5 text-xs"
                >
                  {platformObj.platform.name}
                </span>
              ))}
            </div>
          </div>

          <div className="absolute bottom-2 right-2 text-slate-200 text-sm bg-slate-700 bg-opacity-75 px-2 py-1 rounded">
            <span>Released: {game.released}</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default GameCard;
