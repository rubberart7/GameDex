import React from 'react';
import Link from 'next/link';

export interface Platform {
  id: number;
  name: string;
}

export interface PlatformObj {
  platform: Platform;
}

export interface Game {
  id: number;
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
    <Link href={`/game-details/${game.id}`} passHref>
      <div className="relative bg-slate-950 rounded-lg shadow-md overflow-hidden w-full min-h-[475px] transition-transform
      duration-300 hover:scale-108 cursor-pointer">
        <div className="relative-shine">
          <img
            src={game.background_image}
            alt={game.name}
            className="w-full h-67 object-cover transition-transform duration-500"
          />
        </div>

        <div className="p-4 flex flex-col justify-between h-[calc(100%-268px)]">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h2 className="text-stone-100 text-xl font-bold leading-snug line-clamp-2">
                {game.name}
              </h2>
              <span className="bg-green-500 text-white text-sm font-semibold px-2 py-1 rounded-full shadow-sm">
                {game.rating.toFixed(1)}
              </span>
            </div>

            <div className="text-sm text-slate-400">
              Released: <span className="text-slate-200">{game.released}</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {game.parent_platforms.map((platformObj) => (
                <span
                  key={`parent-${platformObj.platform.id}`}
                  className="bg-slate-800 text-slate-200 px-2 py-0.5 text-xs rounded-full border border-slate-700"
                >
                  {platformObj.platform.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
