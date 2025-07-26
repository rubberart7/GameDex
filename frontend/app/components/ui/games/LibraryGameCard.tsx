import React from 'react';

interface GameData {
  id: number; // This is your local Game ID
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
}

const LibraryGameCard: React.FC<LibraryGameCardProps> = ({ libraryItem }) => {
    const game = libraryItem.game; // Access the nested game object for its details

  // Placeholder for future delete logic
  const handleDeleteClick = () => {
    console.log(`Delete button clicked for game: ${game.name} (Local ID: ${game.id})`);
    // Logic for actual deletion will go here later
  };

  return (
    <div className="relative group flex flex-col bg-slate-900 rounded-lg overflow-hidden
                    shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out
                    min-h-[280px] w-full max-w-[200px] mx-auto cursor-pointer">
      {/* Game Cover Art */}
      <div className="relative w-full h-[200px] overflow-hidden">
        <img
          src={game.background_image || '/placeholder-game.png'} // Use a placeholder if image is missing
          alt={game.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
        />
      </div>

      {/* Game Title */}
      <div className="flex-grow p-3 flex flex-col justify-between">
        <h3 className="text-gray-100 text-base font-semibold truncate">
          {game.name}
        </h3>
        {/* Optional: Add a subtle text for addedAt or status if desired */}
        {/* <p className="text-gray-400 text-xs mt-1">Added: {new Date(libraryItem.addedAt).toLocaleDateString()}</p> */}
      </div>

      {/* Action Button (Delete) - positioned at the bottom like Epic's launch button */}
      <div className="p-3 pt-0"> {/* Adjusted padding to keep button close to title */}
        <button
          onClick={handleDeleteClick}
          className="w-full bg-red-700 text-white py-2 rounded-md
                     hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
                     transition-colors duration-200 ease-in-out font-medium text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default LibraryGameCard;
