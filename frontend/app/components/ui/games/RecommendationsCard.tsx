"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface RecommendedGameData {
  id: number;
  rawgId: number;
  name: string;
  background_image?: string | null;
  rating?: number | null;
  released?: string | null;
  recommendationReason: string;
}

interface RecommendationsCardProps {
  recommendedGame: RecommendedGameData;
  imageWidth?: string;
  imageHeight?: string;
}

const RecommendationsCard: React.FC<RecommendationsCardProps> = ({
  recommendedGame,
  imageWidth = '215px',
  imageHeight = '300px'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const game = recommendedGame;

  return (
    <div
      onClick={() => setIsExpanded((prev) => !prev)}
      className={`
        bg-slate-950
        rounded-sm
        overflow-hidden
        shadow-md
        transition-all duration-300
        cursor-pointer
        flex flex-col
        relative
        group
        w-full
        min-w-[200px]
        max-w-full
        ${isExpanded ? 'scale-105 min-h-[500px]' : 'hover:scale-105 min-h-[380px]'}
      `}
      style={{ width: imageWidth }}
    >
      <div
        className="relative overflow-hidden relative-shine"
        style={{ width: '100%', height: imageHeight }}
      >
        {game.background_image ? (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            className="object-cover rounded-t-md transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400 text-center text-lg rounded-t-md">
            No Image Available
          </div>
        )}
      </div>

      <div className="p-3 flex-grow flex flex-col justify-between bg-slate-950">
        <h3 className="text-gray-300 text-sm font-semibold truncate">
          {game.name}
        </h3>
        <div className="flex items-center text-xs text-gray-400 mt-1">
          {game.rating != null && (
            <span className="mr-1">
              {game.rating.toFixed(1)}
            </span>
          )}
          {game.released && (
            <span className="text-gray-500">
              ({game.released.substring(0, 4)})
            </span>
          )}
        </div>
      </div>

      <div className="p-3 pt-0 mt-auto bg-slate-950">
        <p
          className={`text-sm text-gray-300 italic transition-all duration-300 ${
            isExpanded ? '' : 'line-clamp-3'
          }`}
        >
          &quot;{game.recommendationReason}&quot;
        </p>
      </div>
    </div>
  );
};

export default RecommendationsCard;
