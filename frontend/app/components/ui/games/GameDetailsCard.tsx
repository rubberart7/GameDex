"use client";

import React, { useState, useRef, useEffect } from 'react';
import Button from '@/app/components/ui/common/Button';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';


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

    } catch (error: unknown) {
      console.error(`Error adding game to ${type} collection:`, error);
      setFeedback({ message: 'Network error or server unavailable: Please try again.', type: 'Error' });
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
              <Image
                src={game.background_image}
                alt={`${game.name} background`}
                className="w-full h-full object-cover"
                width={1200}
                height={675}
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
                  <Image src={game.clip?.preview || game.background_image} alt="Trailer thumbnail" className="w-full h-full object-cover" width={96} height={64}/>
                </button>
              )}
              {game.short_screenshots.map((screenshot) => (
                <button
                  key={screenshot.id}
                  onClick={() => setShowTrailer(false)}
                  className={`flex-shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 ${!showTrailer ? 'border-blue-500 ring-2 ring-500' : 'border-slate-700'} hover:border-blue-400 transition duration-200 focus:outline-none`}
                >
                  <Image src={screenshot.image} alt="Game screenshot" className="w-full h-full object-cover" width={96} height={64}/>
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
        </div>

        
        <div className="lg:col-span-1 bg-slate-950 p-6 rounded-xl shadow-2xl self-start sticky top-8" ref={feedbackAreaRef}>
          <div className="flex justify-center mb-6">
            {game.background_image && (
              <Image
                src={game.background_image}
                alt={`${game.name} small image`}
                className="w-32 h-32 object-cover rounded-xl border-2 border-slate-600 shadow-md"
                width={128}
                height={128}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder-game-logo.png';
                }}
              />
            )}
            {!game.background_image && (
              <div className="w-32 h-32 flex items-center justify-center bg-slate-800 text-slate-500 rounded-xl text-sm text-center border-2 border-slate-700">
                No Image
              </div>
            )}
          </div>

          
          <div className="bg-slate-950 rounded-lg p-4 mb-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-300 font-semibold text-lg">Base Game</span>
            </div>

            {game.esrb_rating && (
              <div className="flex items-center gap-3 mb-2 text-slate-200">
                
                <span className="text-sm font-semibold bg-blue-700 px-3 py-1 rounded-md w-12 text-center">{game.esrb_rating.name.slice(0, 2).toUpperCase()}</span>
                <span className="text-sm">ESRB Rating</span>
              </div>
            )}
            {game.metacritic !== null && (
              <div className="flex items-center gap-3 mb-4 text-slate-200">
                
                <span className={`text-sm font-semibold px-3 py-1 rounded-md w-12 text-center
                  ${game.metacritic >= 75 ? 'bg-green-600' : game.metacritic >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`}>
                  {game.metacritic}
                </span>
                <span className="text-sm">Metacritic Score</span>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-4">
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
            </div>
          </div>

          {feedback.message && (
            <div className={`p-3 rounded text-center text-sm font-medium mb-4 border
              ${feedback.type === "Error" ? "bg-red-900/70 text-red-100 border-red-600"
                : feedback.type === "Success" ? "bg-green-900/70 text-green-100 border-green-600"
                : "bg-blue-900/70 text-blue-100 border-blue-600"
              } bg-opacity-80 backdrop-blur-sm`}>
              {feedback.message}
              <button
                onClick={() => setFeedback({ message: "", type: "" })}
                className="absolute top-1 right-2 text-white opacity-70 hover:opacity-100 text-lg"
                aria-label="Close feedback"
              >
                &times;
              </button>
            </div>
          )}

          <div className="space-y-3 text-sm pt-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.745 3A23.933 23.933 0 0 0 12 9c2.755 0 5.455-.23 8.11-0.697M7.5 14.25a3 3 0 0 0-3 3h15.75a3 3 0 1 1 0 6H4.5a3 3 0 0 1-3-3m0-10.5h17.25c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-18 0V4.875c0-.621.504-1.125 1.125-1.125Z" />
                </svg>
                Developer
              </span>
              <span className="text-slate-200 font-medium">{game.developers?.[0]?.name || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" />
                </svg>
                Publisher
              </span>
              <span className="text-slate-200 font-medium">{game.publishers?.[0]?.name || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 12h.008v.008H12V12Zm-3 0h.008v.008H9V12Zm-3 0h.008v.008H6V12Zm3 3h.008v.008H9V15Zm-3 0h.008v.008H6V15Zm3 3h.008v.008H9V18Zm-3 0h.008v.008H6V18Z" />
                </svg>
                Release Date
              </span>
              <span className="text-slate-200 font-medium">{game.released || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25M12 9v6" />
                </svg>
                Platform
              </span>
              <span className="text-slate-200 font-medium">{game.platforms?.[0]?.platform?.name || 'N/A'}</span>
            </div>
            <div className="text-blue-400 text-xs mt-3 cursor-pointer hover:underline text-center">
              See All Editions and Add-Ons
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8 text-sm border-t border-slate-700 pt-6">
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