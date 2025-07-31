// frontend/app/components/ui/games/RecommendationsCard.tsx
"use client";

import React from 'react';

// Define types for the recommended game data
// This matches the structure returned by your backend's getRecommendations controller
interface RecommendedGameData {
  id: number; // Your local Game ID
  rawgId: number;
  name: string;
  background_image?: string | null; // Match backend's string | null
  rating?: number | null; // Match backend's number | null
  released?: string | null; // Match backend's string | null
  recommendationReason: string; // The AI's reason for recommending
  // Add any other lean Game model fields you included in the backend response
}

interface RecommendationsCardProps {
  recommendedGame: RecommendedGameData;
  imageWidth?: string;
  imageHeight?: string;
}

const RecommendationsCard: React.FC<RecommendationsCardProps> = ({
  recommendedGame,
  imageWidth = '215px', // Default width for a card in the grid
  imageHeight = '300px' // Default height for a card in the grid
}) => {
  // Directly use recommendedGame as it contains all necessary details
  const game = recommendedGame;

  return (
    <div className="
      bg-slate-900
      rounded-lg
      overflow-hidden
      shadow-lg
      transform transition-transform duration-300 hover:scale-105
      flex flex-col
      relative
      group
      min-h-[350px]
      w-full max-w-[200px] mx-auto
    ">
      {/* Game Cover Art */}
      <div className="relative w-full h-[200px] overflow-hidden">
        {game.background_image ? (
          <img
            src={game.background_image}
            alt={game.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
          />
        ) : (
          <div
            className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400 text-center text-lg rounded-t-md"
          >
            No Image Available
          </div>
        )}
      </div>

      {/* Game Title */}
      <div className="p-3 flex-grow flex flex-col justify-between">
        <h3 className="text-gray-100 text-base font-semibold truncate">
          {game.name}
        </h3>
        {/* Rating and Release Date */}
        <div className="flex items-center text-xs text-gray-400 mt-1">
          {/* FIXED: Conditionally render the rating span only if game.rating is not null or undefined */}
          {game.rating != null && ( // Checks if game.rating is neither null nor undefined
            <span className="bg-green-600 text-white px-1 py-0.5 rounded mr-1">
              {game.rating.toFixed(1)}
            </span>
          )}
          {game.released && (
            <span>{game.released.substring(0, 4)}</span> // Display year only
          )}
        </div>
      </div>

      {/* AI Recommendation Reason */}
      <div className="p-3 pt-0 mt-auto">
        <p className="text-sm text-gray-300 italic line-clamp-3">
          "{game.recommendationReason}"
        </p>
        <div className="mt-2 text-right">
          {/* Optional: Add a link to game details if you click on the card */}
          {/* <Link href={`/games/${game.rawgId}`} passHref>
            <a className="text-blue-400 hover:underline text-xs">Learn More</a>
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsCard;