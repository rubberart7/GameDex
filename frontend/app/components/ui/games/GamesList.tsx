// frontend/app/components/ui/games/GamesList.tsx

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameCard, { Game, Platform, PlatformObj, Genre } from './GameCard';
import LoadingSpinner from '@/app/components/ui/common/LoadingSpinner';

const CACHE_KEY_PREFIX = 'cachedGamesList_page_';
const CACHE_EXPIRATION_MS = 60 * 60 * 1000;

// FIX: Define MAX_GAME_PAGES directly in the frontend component
// This value MUST match the MAX_GAME_PAGES constant in your backend's games.ts file.
const MAX_GAME_PAGES = 3; 

const GamesList = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('released');
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  const categories = [
    { name: 'Action', slug: 'action' },
    { name: 'Adventure', slug: 'adventure' },
    { name: 'RPG', slug: 'role-playing-games-rpg' },
    { name: 'Strategy', slug: 'strategy' },
    { name: 'Shooter', slug: 'shooter' },
    { name: 'Puzzle', slug: 'puzzle' },
    { name: 'Racing', slug: 'racing' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Simulation', slug: 'simulation' },
    { name: 'Indie', slug: 'indie' },
    { name: 'Platformer', slug: 'platformer' },
    { name: 'Fighting', slug: 'fighting' },
    { name: 'Family', slug: 'family' },
    { name: 'Arcade', slug: 'arcade' },
    { name: 'Casual', slug: 'casual' },
  ];

  const sortOptions = [
    { name: 'Release Date (Newest)', value: 'released' },
    { name: 'Name (A-Z)', value: 'name-asc' },
    { name: 'Name (Z-A)', value: 'name-desc' },
    { name: 'Metacritic Score (Highest)', value: 'metacritic' },
  ];

  const isFetchingRef = useRef(false);

  const fetchGames = useCallback(async (pageNumber: number) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    const cacheKey = `${CACHE_KEY_PREFIX}${pageNumber}`;
    const cachedData = localStorage.getItem(cacheKey);

    try {
      if (cachedData) {
        try {
          const { data, timestamp, previousUrl, nextUrl } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
            setGames(data);
            // FIX: Set hasPreviousPage based on pageNumber directly
            setHasPreviousPage(pageNumber > 1);
            setHasNextPage(!!nextUrl);
            setLoading(false);
            isFetchingRef.current = false;
            console.log(`Games for page ${pageNumber} loaded from cache.`);
            return;
          } else {
            console.log(`Cached games for page ${pageNumber} expired, fetching new data.`);
            localStorage.removeItem(cacheKey);
          }
        } catch (e) {
          console.error(`Failed to parse cached data for page ${pageNumber}:`, e);
          localStorage.removeItem(cacheKey);
        }
      }

      console.log(`Fetching games from API for page ${pageNumber}...`);
      const res = await fetch(`http://localhost:4000/api/games?page=${pageNumber}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch games: ${res.statusText}`);
      }
      const apiResponse = await res.json();

      const newGames: Game[] = apiResponse.results.map((game: any) => ({
        ...game,
        genres: game.genres || [],
      }));

      setGames(newGames);
      // FIX: Set hasPreviousPage based on pageNumber directly
      setHasPreviousPage(pageNumber > 1);
      setHasNextPage(!!apiResponse.next);

      try {
        const dataToCache = {
          data: newGames,
          timestamp: Date.now(),
          // FIX: Update previousUrl in cache based on pageNumber directly
          previousUrl: pageNumber > 1 ? `http://localhost:4000/api/games?page=${pageNumber - 1}` : null,
          nextUrl: apiResponse.next,
        };
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
        console.log(`Games for page ${pageNumber} fetched and cached.`);
      } catch (e) {
        console.error(`Failed to cache games data for page ${pageNumber}:`, e);
      }

    } catch (err: any) {
      console.error("Error fetching games:", err);
      setError(err.message || "An unknown error occurred while fetching games.");
      // On actual error (e.g. network down), it's okay to disable previous as we can't fetch anything
      setHasPreviousPage(false); 
      setHasNextPage(false);
      setGames([]); // Clear games on fetch error to prevent rendering undefined game
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (currentPage > 0) {
      fetchGames(currentPage);
    }
  }, [currentPage, fetchGames]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedSort]);

  useEffect(() => {
    let currentGames = [...games];

    if (searchTerm) {
      currentGames = currentGames.filter(game =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      currentGames = currentGames.filter(game =>
        game.genres && game.genres.some(genre => genre.slug === selectedCategory)
      );
    }

    currentGames.sort((a, b) => {
      switch (selectedSort) {
        case 'released':
          const dateA = a.released ? new Date(a.released).getTime() : 0;
          const dateB = b.released ? new Date(b.released).getTime() : 0;
          return dateB - dateA;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'metacritic':
          return (b.metacritic || 0) - (a.metacritic || 0);
        default:
          return 0;
      }
    });

    setFilteredGames(currentGames);
  }, [games, searchTerm, selectedCategory, selectedSort]);

  const handleNextPage = () => {
    if (!loading && hasNextPage) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (!loading && hasPreviousPage) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  if (loading && games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen p-8 bg-slate-950 text-gray-100">
        <LoadingSpinner />
        <p className="mt-4 text-lg">Loading games...</p>
      </div>
    );
  }

  if (error && games.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen p-8 bg-slate-950 text-red-400">
        <p className="text-lg">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative flex-grow min-w-0 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search Store"
            className="w-full pl-10 pr-4 py-2 rounded-md bg-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <select
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.slug} value={category.slug}>{category.name}</option>
            ))}
          </select>

          <select
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.name}</option>
            ))}
          </select>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-blue-400">Games</h2>

      {/* Conditional rendering for game grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3
                         sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] sm:gap-4
                         md:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] md:gap-6
                         lg:grid-cols-[repeat(auto-fill,minmax(205px,1fr))] lg:gap-8
                         min-w-0">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        // Only show "No games found" message if not loading AND no games are found after filtering
        !loading && (
          <div className="flex items-center justify-center h-full text-gray-400 py-10">
            <p className="text-lg">No games found matching your criteria.</p>
            {/* Optional: Add a specific message if it's due to the backend page limit */}
            {currentPage > MAX_GAME_PAGES && ( // Use currentPage > MAX_GAME_PAGES for the message
                <p className="text-sm mt-2 text-gray-500">You've reached the end of available pages due to API limits.</p>
            )}
          </div>
        )
      )}


      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-8 gap-4">
        <button
          onClick={handlePreviousPage}
          disabled={loading || !hasPreviousPage}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Previous
        </button>

        <span className="text-lg font-medium text-slate-200">Page {currentPage}</span>

        <button
          onClick={handleNextPage}
          disabled={loading || !hasNextPage}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

      {/* Optional: Show loading spinner during subsequent page fetches */}
      {loading && filteredGames.length > 0 && ( // Show only if loading and some games are already displayed
        <div className="bg-slate-950 text-slate-100 min-h-screen p-10 flex flex-col items-center">
          <LoadingSpinner className="text-blue-500 w-12 h-12 mb-4" />
          <p>Loading your game library...</p>
        </div>
      )}
    </div>
  );
};

export default GamesList;