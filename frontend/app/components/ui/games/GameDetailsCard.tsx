"use client";

import React, { useState, useRef, useEffect } from 'react';
import Button from '@/app/components/ui/common/Button';
import { useAuth } from '@/app/context/AuthContext';
// Removed useRouter import since it's no longer used

interface GameDetails {
  id: number;
  name: string;
  description_raw: string;
  background_image: string;
  background_image_additional: string;
  released: string;
  metacritic: number | null;
  platforms: Array<{ platform: { id: number; name: string; slug: string } }>;
  genres: Array<{ id: number; name: string; slug: string }>,
  developers: Array<{ id: number; name: string; slug: string }>,
  publishers: Array<{ id: number; name: string; slug: string }>,
  esrb_rating: { id: number; name: string; slug: string } | null;
  clip: { clip: string; preview: string } | null;
  short_screenshots: Array<{ id: number; image: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
}

interface GameDetailsCardProps {
  game: GameDetails;
}

const GameDetailsCard: React.FC<GameDetailsCardProps> = ({ game }) => {
  const [showTrailer, setShowTrailer] = useState(true);
  const { accessToken, loading: authLoading, fetchNewAccessToken, incrementUserCollectionsVersion } = useAuth();

  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "Error" | "Success" | "Info" | "" }>({
    message: "",
    type: "",
  });

  const feedbackAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (feedback.message && feedbackAreaRef.current && !feedbackAreaRef.current.contains(event.target as Node)) {
        setFeedback({ message: "", type: "" });
      }
    };

    if (feedback.message) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [feedback.message]);

  if (!game) {
    return (
      <div className="text-gray-400 p-4 text-center">
        No game data available.
      </div>
    );
  }

  const hasTrailer = game.clip && game.clip.clip;

  const featureTags = game.tags?.filter(tag =>
    ['multiplayer', 'singleplayer', 'co-op', 'controller'].includes(tag.slug)
  ).map(tag => {
      if (tag.slug === 'controller') return 'Controller Support';
      if (tag.slug === 'multiplayer') return 'Multiplayer';
      if (tag.slug === 'singleplayer') return 'Single Player';
      if (tag.slug === 'co-op') return 'Co-Op';
      return tag.name;
  });

  const handleAddToCollectionLogic = async (type: 'wishlist' | 'library') => {
    setFeedback({ message: "", type: "" });

    const setIsLoading = type === 'wishlist' ? setIsAddingToWishlist : setIsAddingToLibrary;
    setIsLoading(true);

    try {
      if (authLoading) {
        setFeedback({ message: 'Checking login status...', type: 'Info' });
        return;
      }

      if (!accessToken) {
        setFeedback({ message: 'You must be logged in to do that.', type: 'Error' });
        return;
      }

      const endpoint = type === 'wishlist' ? 'add-to-wishlist' : 'add-to-library';
      const successMessage = type === 'wishlist' ? 'Added to wishlist!' : 'Added to library!';
      const errorMessagePrefix = type === 'wishlist' ? 'wishlist' : 'library';

      const response = await fetch(`http://localhost:4000/api/user/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ gameId: game.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 && result.expired) {
          const newAccessToken = await fetchNewAccessToken();
          if (newAccessToken) {
            const retryResponse = await fetch(`http://localhost:4000/api/user/${endpoint}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newAccessToken}`,
              },
              credentials: 'include',
              body: JSON.stringify({ gameId: game.id }),
            });
            const retryResult = await retryResponse.json();
            if (retryResponse.ok) {
              setFeedback({ message: retryResult.message || successMessage, type: 'Success' });
              incrementUserCollectionsVersion();
            } else {
              setFeedback({ message: retryResult.message || `Failed to add game to ${errorMessagePrefix}. Please log in again.`, type: 'Error' });
            }
          } else {
            setFeedback({ message: 'Session expired. Please log in again.', type: 'Error' });
          }
        } else if (response.status === 409) {
          setFeedback({ message: result.message || `Game is already in your ${errorMessagePrefix}.`, type: 'Info' });
        } else {
          setFeedback({ message: result.message || `Failed to add game to ${errorMessagePrefix}.`, type: 'Error' });
        }
        return;
      }

      setFeedback({ message: result.message || successMessage, type: 'Success' });
      incrementUserCollectionsVersion();

    } catch (error: any) {
      console.error(`Error adding game to ${type} collection:`, error);
      setFeedback({ message: `Network error or server unavailable: ${error.message || 'Please try again.'}`, type: 'Error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWishList = async () => {
    await handleAddToCollectionLogic('wishlist');
  };

  const handleAddToLibrary = async () => {
    await handleAddToCollectionLogic('library');
  };

  const isWishlistButtonDisabled = authLoading || isAddingToWishlist || isAddingToLibrary;
  const isLibraryButtonDisabled = authLoading || isAddingToLibrary || isAddingToWishlist;

  const wishlistButtonText = authLoading
    ? 'Checking Login...'
    : isAddingToWishlist
      ? 'Adding...'
      : 'Add to Wishlist';

  const libraryButtonText = authLoading
    ? 'Checking Login...'
    : isAddingToLibrary
      ? 'Adding...'
      : 'Add to Library';

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen p-8 flex justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-blue-400">{game.name} Standard Edition</h1>

          <div className="w-full bg-slate-900 rounded-lg overflow-hidden mb-6 aspect-video shadow-lg">
            {hasTrailer && showTrailer ? (
              <video
                src={game.clip?.clip}
                poster={game.clip?.preview || game.background_image}
                controls
                className="w-full h-full object-cover"
                preload="metadata"
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

          {game.short_screenshots && game.short_screenshots.length > 0 && (
            <div className="flex space-x-2 overflow-x-auto pb-2 -mx-8 px-8 mb-6">
              {hasTrailer && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className={`flex-shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 ${showTrailer ? 'border-blue-500 ring-2 ring-500' : 'border-slate-700'} hover:border-blue-400 transition duration-200 focus:outline-none`}
                >
                  <img src={game.clip?.preview || game.background_image} alt="Trailer thumbnail" className="w-full h-full object-cover" />
                </button>
              )}
              {game.short_screenshots.map((screenshot) => (
                <button
                  key={screenshot.id}
                  onClick={() => setShowTrailer(false)}
                  className={`flex-shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 ${!showTrailer ? 'border-blue-500 ring-2 ring-500' : 'border-slate-700'} hover:border-blue-400 transition duration-200 focus:outline-none`}
                >
                  <img src={screenshot.image} alt="Game screenshot" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {!hasTrailer && game.short_screenshots && game.short_screenshots.length > 0 && (
            <div className="text-sm text-slate-400 mb-4 text-center">
              Only screenshots available.
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-blue-300">About This Game</h2>
            <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
              {game.description_raw || 'No description available.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <strong className="text-slate-400 block mb-1">Genres</strong>
              <div className="flex flex-wrap gap-2">
                {game.genres && game.genres.length > 0 ? (
                  game.genres.map(genre => (
                    <span key={genre.id} className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-200">
                      {genre.name}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">N/A</span>
                )}
              </div>
            </div>
            <div>
              <strong className="text-slate-400 block mb-1">Features</strong>
              <div className="flex flex-wrap gap-2">
                {featureTags && featureTags.length > 0 ? (
                  featureTags.map((feature, index) => (
                    <span key={index} className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-200">
                      {feature}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">N/A</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-fuchsia-900 rounded-lg p-4 flex items-center gap-4 text-sm shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-fuchsia-300">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.532a.75.75 0 0 1 .411-.53ZM9.743 7.82a.75.75 0 0 0-1.06 1.06l2.106 2.106-.316.316a.75.75 0 0 0 1.06 1.06l.316-.316 2.106 2.106a.75.75 0 0 0 1.06-1.06L12.31 11.23l.316-.316a.75.75 0 0 0-1.06-1.06l-.316.316L9.743 7.82Z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-fuchsia-200">Unlock thrill with EA Play.</p>
              <p className="text-fuchsia-300">Get unlimited access to a collection of EA's top titles, specials, and 10% off EA digital purchases.</p>
            </div>
            <button className="ml-auto px-4 py-2 bg-fuchsia-700 hover:bg-fuchsia-600 rounded-md text-white text-sm shadow-sm">
              Explore
            </button>
          </div>
        </div>

        <div className="lg:col-span-1 bg-slate-900 p-6 rounded-lg shadow-lg self-start sticky top-8" ref={feedbackAreaRef}>
          <div className="flex justify-center mb-6">
            {game.background_image && (
              <img
                src={game.background_image}
                alt={`${game.name} small image`}
                className="w-24 h-24 object-cover rounded-md border border-slate-700"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder-game-logo.png';
                }}
              />
            )}
            {!game.background_image && (
              <div className="w-24 h-24 flex items-center justify-center bg-slate-700 text-slate-400 rounded-md text-xs text-center">
                No Image
              </div>
            )}
          </div>

          {game.esrb_rating && (
            <div className="flex items-center gap-2 mb-4 text-slate-200">
              <span className="text-lg font-bold bg-slate-700 px-2 py-1 rounded">{game.esrb_rating.name.slice(0, 2).toUpperCase()}</span>
              <span className="text-sm">{game.esrb_rating.name}</span>
            </div>
          )}
          {game.metacritic !== null && (
            <div className="flex items-center gap-2 mb-4 text-slate-200">
              <span className={`text-lg font-bold px-2 py-1 rounded
                ${game.metacritic >= 75 ? 'bg-green-600' : game.metacritic >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`}>
                {game.metacritic}
              </span>
              <span className="text-sm">Metacritic Score</span>
            </div>
          )}

          <div className="text-sm mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Base Game</span>
              <span className="text-lg font-semibold text-slate-50">${game.id === 1 ? '69.99' : 'Price TBD'}</span>
            </div>
            <div className="flex items-center text-green-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              Save 10% with EA Play
            </div>
          </div>

          {/* Button props are correctly set to only affect their own loading state */}
          <Button
            variant="addToLibrary"
            onClick={handleAddToLibrary}
            loading={isAddingToLibrary}
            disabled={isLibraryButtonDisabled || isAddingToWishlist}
            loadingText={libraryButtonText}
          >
            {libraryButtonText}
          </Button>
          <Button
            variant="addToWishList"
            onClick={handleAddToWishList}
            loading={isAddingToWishlist}
            disabled={isWishlistButtonDisabled || isAddingToLibrary}
            loadingText={wishlistButtonText}
          >
            {wishlistButtonText}
          </Button>

          {feedback.message && (
            <div className={`relative p-3 rounded text-center font-semibold mb-4 border
              ${feedback.type === "Error" ? "bg-red-800 text-red-100 border-red-500"
                : feedback.type === "Success" ? "bg-green-800 text-green-100 border-green-500"
                : "bg-blue-800 text-blue-100 border-blue-500"
              }`}>
              {feedback.message}
              <button
                onClick={() => setFeedback({ message: "", type: "" })}
                className="absolute top-1 right-2 text-white opacity-70 hover:opacity-100 cursor-pointer"
              >
                &times;
              </button>
            </div>
          )}

          <div className="text-xs text-slate-400 mb-6 border-b border-slate-800 pb-4">
            <div className="flex justify-between mb-1">
              <span>Epic Rewards</span>
              <span className="text-lime-400">Earn 20% Back &gt;</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Refund Type</span>
              <span>Self-Refundable <span title="Some help text about refund type">&#9432;</span></span>
            </div>
          </div>

          <div className="space-y-2 text-sm pt-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Developer</span>
              <span className="text-slate-200">{game.developers?.[0]?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Publisher</span>
              <span className="text-slate-200">{game.publishers?.[0]?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Available</span>
              <span className="text-slate-200">{game.released || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Platform</span>
              <span className="text-slate-200">{game.platforms?.[0]?.platform?.name || 'N/A'}</span>
            </div>
            <div className="text-blue-400 text-xs mt-2 cursor-pointer hover:underline">
              See All Editions and Add-Ons
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8 text-sm">
            <button className="flex items-center text-slate-400 hover:text-blue-400 transition duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186A.75.75 0 0 1 7.5 10.5h6l2.201 2.834c.304.42-.028.96-.516.96H7.5V15a.75.75 0 0 0 1.5 0v-1.5m-4.782-2.186c0-.923.474-1.744 1.256-2.227L15 2.828V2.25a.75.75 0 0 1 1.5 0v.578A2.25 2.25 0 0 0 18 4.5v.75m-8.782 9.093l-2.92 2.92c-.82.82-.095 2.296 1.006 2.296h8.04c1.101 0 1.826-1.476 1.005-2.296l-2.92-2.92m-6.402-1.138A2.25 2.25 0 1 1 15 10.907M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186A.75.75 0 0 1 7.5 10.5h6l2.201 2.834c.304.42-.028.96-.516.96H7.5V15a.75.75 0 0 0 1.5 0v-1.5m-4.782-2.186c0-.923.474-1.744 1.256-2.227L15 2.828V2.25a.75.75 0 0 1 1.5 0v.578A2.25 2.25 0 0 0 18 4.5v.75m-8.782 9.093l-2.92 2.92c-.82.82-.095 2.296 1.006 2.296h8.04c1.101 0 1.826-1.476 1.005-2.296l-2.92-2.92" />
              </svg>
              <span>Share</span>
            </button>
            <button className="flex items-center text-slate-400 hover:text-blue-400 transition duration-200">
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