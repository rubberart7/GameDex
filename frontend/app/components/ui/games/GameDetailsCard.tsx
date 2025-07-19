// frontend/app/components/ui/games/GameDetailsCard.tsx

import React, { useState } from 'react';

// Define a type for the game data (simplified for this example)
interface GameDetails {
  id: number;
  name: string;
  description_raw: string; // Plain text description
  background_image: string; // This will be used for the main media and the small logo
  background_image_additional: string; // Often used for screenshots
  released: string;
  metacritic: number | null;
  platforms: Array<{ platform: { id: number; name: string; slug: string } }>;
  genres: Array<{ id: number; name: string; slug: string }>,
  developers: Array<{ id: number; name: string; slug: string }>,
  publishers: Array<{ id: number; name: string; slug: string }>,
  esrb_rating: { id: number; name: string; slug: string } | null;
  clip: { clip: string; preview: string } | null; // For trailers
  short_screenshots: Array<{ id: number; image: string }>; // For screenshots
  tags: Array<{ id: number; name: string; slug: string }>; // For features like 'Multiplayer'
  // You can add more fields if needed and they exist in your API response
}

interface GameDetailsCardProps {
  game: GameDetails;
}

const GameDetailsCard: React.FC<GameDetailsCardProps> = ({ game }) => {
  const [showTrailer, setShowTrailer] = useState(true); // Control showing trailer or screenshots

  if (!game) {
    return (
      <div className="text-gray-400 p-4 text-center">
        No game data available.
      </div>
    );
  }

  // Determine if a trailer is available
  const hasTrailer = game.clip && game.clip.clip;

  // Filter tags to represent common "features"
  const featureTags = game.tags?.filter(tag =>
    ['multiplayer', 'singleplayer', 'co-op', 'controller'].includes(tag.slug)
  ).map(tag => tag.name.replace(/ /g, ' ')); // Basic capitalization/spacing adjustment

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-8 flex justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Main Content (Trailer/Screenshots & Description) */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{game.name} Standard Edition</h1>

          {/* Media Selector (Trailer/Screenshots) */}
          <div className="w-full bg-gray-800 rounded-lg overflow-hidden mb-6 aspect-video">
            {hasTrailer && showTrailer ? (
              <video
                src={game.clip?.clip}
                poster={game.clip?.preview || game.background_image}
                controls
                className="w-full h-full object-cover"
                preload="metadata" // Load metadata but not the whole video
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={game.background_image}
                alt={`${game.name} background`}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Screenshot/Trailer Selector (Below the main media) */}
          {game.short_screenshots && game.short_screenshots.length > 0 && (
            <div className="flex space-x-2 overflow-x-auto pb-2 -mx-8 px-8 mb-6"> {/* Added mx-8 px-8 to allow overflow scroll to edges */}
              {hasTrailer && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className={`flex-shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 ${showTrailer ? 'border-blue-500' : 'border-transparent'} hover:border-blue-500 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <img src={game.clip?.preview || game.background_image} alt="Trailer thumbnail" className="w-full h-full object-cover" />
                </button>
              )}
              {game.short_screenshots.map((screenshot) => (
                <button
                  key={screenshot.id}
                  onClick={() => setShowTrailer(false)}
                  className={`flex-shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 ${!showTrailer ? 'border-blue-500' : 'border-transparent'} hover:border-blue-500 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <img src={screenshot.image} alt="Game screenshot" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {!hasTrailer && game.short_screenshots && game.short_screenshots.length > 0 && (
              <div className="text-sm text-gray-400 mb-4 text-center">
                  Only screenshots available.
              </div>
          )}


          {/* Description Section */}
          <div className="mb-6">
            <p className="text-gray-300 leading-relaxed text-sm">
              {game.description_raw || "No description available."}
            </p>
          </div>

          {/* Genres and Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <strong className="text-gray-400 block mb-1">Genres</strong>
              <div className="flex flex-wrap gap-2">
                {game.genres && game.genres.length > 0 ? (
                  game.genres.map(genre => (
                    <span key={genre.id} className="px-3 py-1 bg-gray-700 rounded-full text-xs">
                      {genre.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </div>
            </div>
            <div>
              <strong className="text-gray-400 block mb-1">Features</strong>
              <div className="flex flex-wrap gap-2">
                {featureTags && featureTags.length > 0 ? (
                  featureTags.map((feature, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-700 rounded-full text-xs">
                      {feature}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </div>
            </div>
          </div>

          {/* EA Play/Other subscription info if applicable (Placeholder) */}
          <div className="bg-purple-800 rounded-lg p-4 flex items-center gap-4 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.532a.75.75 0 0 0 .919 1.053 4.524 4.524 0 0 1 .411-.53ZM9.743 7.82a.75.75 0 0 0-1.06 1.06l2.106 2.106-.316.316a.75.75 0 0 0 1.06 1.06l.316-.316 2.106 2.106a.75.75 0 0 0 1.06-1.06L12.31 11.23l.316-.316a.75.75 0 0 0-1.06-1.06l-.316.316L9.743 7.82Z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-white">Unlock thrill with EA Play.</p>
              <p className="text-gray-200">Get unlimited access to a collection of EA's top titles, specials, and 10% off EA digital purchases.</p>
            </div>
            <button className="ml-auto px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md text-white text-sm">
              Explore
            </button>
          </div>

        </div>

        {/* Right Column - Sidebar (Purchase & Info) */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg self-start sticky top-8"> {/* sticky top-8 for fixed sidebar */}
          <div className="flex justify-center mb-6">
            {/* Displaying a smaller version of the game's background_image as the 'logo' */}
            {game.background_image && (
              <img
                src={game.background_image}
                alt={`${game.name} small image`}
                className="w-24 h-24 object-cover rounded-md border border-gray-700" // Added object-cover to crop/fit
                onError={(e) => {
                  // Optional: Fallback to a generic game icon if the image fails
                  e.currentTarget.onerror = null; // Prevents infinite loops
                  e.currentTarget.src = "/placeholder-game-logo.png"; // Make sure you have this in your public folder
                }}
              />
            )}
            {!game.background_image && (
                <div className="w-24 h-24 flex items-center justify-center bg-gray-700 text-gray-400 rounded-md text-xs text-center">
                    No Image
                </div>
            )}
          </div>

          {game.esrb_rating && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-bold">RP</span>
              <span className="text-sm">{game.esrb_rating.name}</span>
            </div>
          )}

          <div className="text-sm mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Base Game</span>
              <span className="text-lg font-semibold text-gray-50">${game.id === 1 ? '69.99' : 'Price TBD'}</span> {/* Dummy price */}
            </div>
            <div className="flex items-center text-green-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              Save 10% with EA Play
            </div>
          </div>

          <button className="w-full py-3 mb-3 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold text-white transition duration-200">
            Add to Library
          </button>
          <button className="w-full py-3 mb-6 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-md font-semibold transition duration-200">
            Add to Wishlist
          </button>

          <div className="text-xs text-gray-400 mb-6">
            <div className="flex justify-between mb-1">
              <span>Epic Rewards</span>
              <span className="text-green-400">Earn 20% Back &gt;</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Refund Type</span>
              <span>Self-Refundable <span title="Some help text about refund type">&#9432;</span></span>
            </div>
          </div>

          {/* Developer, Publisher, Available, Platform */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Developer</span>
              <span>{game.developers?.[0]?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Publisher</span>
              <span>{game.publishers?.[0]?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Available</span>
              <span>{game.released || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Platform</span>
              <span>{game.platforms?.[0]?.platform?.name || 'N/A'}</span> {/* Only showing first platform for simplicity */}
            </div>
            <div className="text-blue-400 text-xs mt-2">
                See All Editions and Add-Ons
            </div>
          </div>

          {/* Share/Report buttons */}
          <div className="flex justify-center gap-4 mt-8 text-sm">
            <button className="flex items-center text-gray-400 hover:text-white transition duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186A.75.75 0 0 1 7.5 10.5h6l2.201 2.834c.304.42-.028.96-.516.96H7.5V15a.75.75 0 0 0 1.5 0v-1.5m-4.782-2.186c0-.923.474-1.744 1.256-2.227L15 2.828V2.25a.75.75 0 0 1 1.5 0v.578A2.25 2.25 0 0 0 18 4.5v.75m-8.782 9.093l-2.92 2.92c-.82.82-.095 2.296 1.006 2.296h8.04c1.101 0 1.826-1.476 1.005-2.296l-2.92-2.92m-6.402-1.138A2.25 2.25 0 1 1 15 10.907M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186A.75.75 0 0 1 7.5 10.5h6l2.201 2.834c.304.42-.028.96-.516.96H7.5V15a.75.75 0 0 0 1.5 0v-1.5m-4.782-2.186c0-.923.474-1.744 1.256-2.227L15 2.828V2.25a.75.75 0 0 1 1.5 0v.578A2.25 2.25 0 0 0 18 4.5v.75m-8.782 9.093l-2.92 2.92c-.82.82-.095 2.296 1.006 2.296h8.04c1.101 0 1.826-1.476 1.005-2.296l-2.92-2.92" />
              </svg>
              <span>Share</span>
            </button>
            <button className="flex items-center text-gray-400 hover:text-white transition duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <span>Report</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GameDetailsCard;