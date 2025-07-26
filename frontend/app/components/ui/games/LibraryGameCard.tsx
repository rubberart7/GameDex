// frontend/app/components/ui/games/LibraryGameCard.tsx
"use client";

import React from 'react';

interface GameData {
  id: number;
  rawgId: number;
  name: string;
  background_image?: string;
  rating?: number;
  released?: string;
}

interface LibraryItem {
  id: number;
  userId: number;
  gameId: number;
  status: string;
  addedAt: string;
  game: GameData;
}

interface LibraryGameCardProps {
  libraryItem: LibraryItem;
  imageWidth?: string;
  imageHeight?: string;
}

const LibraryGameCard: React.FC<LibraryGameCardProps> = ({
  libraryItem,
  imageWidth = '215px',
  imageHeight = '300px'
}) => {
  const { game } = libraryItem;

  const handleDeleteClick = () => {
    console.log(`Attempting to delete game with ID: ${game.id}`);
    alert('Delete functionality not yet implemented!');
  };

  return (
    <div className="
      bg-slate-950
      rounded-sm
      overflow-hidden
      shadow-md
      transform transition-transform duration-300 hover:scale-108
      cursor-pointer
      flex flex-col
      relative
    ">
      {/* Image Container */}
      <div className="relative overflow-hidden relative-shine"
           style={{ width: imageWidth, height: imageHeight }}>
        {game.background_image ? (
          <img
            src={game.background_image}
            alt={game.name}
            className="w-full h-full object-cover rounded-t-md transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400 text-center text-lg rounded-t-md"
          >
            No Image Available
          </div>
        )}
      </div>

      <div className="p-3 flex-grow flex items-center bg-slate-950">
        <h3 className="text-gray-300 text-sm font-semibold truncate">
          {game.name}
        </h3>
      </div>

      <div className="
        w-full
        bg-slate-950
        hover:bg-slate-900
        cursor-pointer
        transition-colors duration-200
        py-2.5 px-3
        flex justify-center items-center
        group
        mt-auto
      ">
        <button
          onClick={handleDeleteClick}
          className="
            flex items-center
            text-gray-300 group-hover:text-gray-100 // Changed from group-hover:text-white for subtlety
            focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50
            w-full h-full text-base font-semibold
            cursor-pointer
          "
          aria-label={`Delete ${game.name} from library`}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default LibraryGameCard;