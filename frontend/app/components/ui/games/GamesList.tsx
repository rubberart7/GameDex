
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameCard, { Game } from './GameCard';
import LoadingSpinner from '@/app/components/ui/common/LoadingSpinner';

const CACHE_KEY_PREFIX = 'cachedGamesList_page_';
const CACHE_EXPIRATION_MS = 60 * 60 * 1000;

const MAX_GAME_PAGES = 3;

const getInitialStateFromCache = (): { 
  initialGames: Game[]; 
  initialLoading: boolean; 
  initialHasNextPage: boolean; 
  initialFilteredGames: Game[];
} => {
  if (typeof window === 'undefined') { // Prevent localStorage access on server-side render
    return { 
      initialGames: [], 
      initialLoading: true, 
      initialHasNextPage: true,
      initialFilteredGames: []
    };
  }

  const initialCacheKey = `${CACHE_KEY_PREFIX}1`; // Always check for page 1 on initial load
  const cachedData = localStorage.getItem(initialCacheKey);

  if (cachedData) {
    try {
      const { data, timestamp, nextUrl } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
        
        return {
          initialGames: data,
          initialLoading: false, 
          initialHasNextPage: !!nextUrl, 
          initialFilteredGames: data 
        };
      } else {
        localStorage.removeItem(initialCacheKey);
      }
    } catch (e) {
      console.error("Error: ", e);
      localStorage.removeItem(initialCacheKey);
    }
  }
  return { 
    initialGames: [], 
    initialLoading: true, 
    initialHasNextPage: true,
    initialFilteredGames: []
  };
};

const GamesList = () => {
  const initialState = getInitialStateFromCache();
  
  const [games, setGames] = useState<Game[]>(initialState.initialGames);
  const [loading, setLoading] = useState<boolean>(initialState.initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('released');
  const [filteredGames, setFilteredGames] = useState<Game[]>(initialState.initialFilteredGames);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(initialState.initialHasNextPage);
  
  
  const isInitialMount = useRef(true);

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
    setError(null);

    const cacheKey = `${CACHE_KEY_PREFIX}${pageNumber}`;
    const cachedData = localStorage.getItem(cacheKey);

    const isCacheValid = (cachedData && JSON.parse(cachedData).timestamp && Date.now() - JSON.parse(cachedData).timestamp < CACHE_EXPIRATION_MS);

    
    if (!isCacheValid && (games.length === 0 || pageNumber > 1)) { 
        setLoading(true);
    }

    try {
      if (isCacheValid) {
        try {
          const { data, nextUrl } = JSON.parse(cachedData);
          setGames(data);
          setHasPreviousPage(pageNumber > 1);
          setHasNextPage(!!nextUrl);
          setLoading(false); 
          isFetchingRef.current = false;
          return; 
        } catch (e) {
          console.error("Error: ", e);
          localStorage.removeItem(cacheKey); 
        }
      }

      
      const res = await fetch(`http://localhost:4000/api/games?page=${pageNumber}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch games: ${res.statusText}`);
      }
      const apiResponse = await res.json();

      const newGames: Game[] = apiResponse.results.map((game: Game) => ({
        ...game,
        genres: game.genres || [],
      }));

      setGames(newGames);
      setHasPreviousPage(pageNumber > 1);
      setHasNextPage(!!apiResponse.next);

      try {
        const dataToCache = {
          data: newGames,
          timestamp: Date.now(),
          previousUrl: pageNumber > 1 ? `http://localhost:4000/api/games?page=${pageNumber - 1}` : null,
          nextUrl: apiResponse.next,
        };
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
      } catch (e) {
        console.error("Error: ", e);
      }

    } catch (err: unknown) {
      setError("An unknown error occurred while fetching games.");
      console.error("Error: ", err);
      setHasPreviousPage(false);
      setHasNextPage(false);
      setGames([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []); 

  useEffect(() => {
    if (isInitialMount.current && currentPage === 1 && initialState.initialGames.length > 0) {
      setHasPreviousPage(false); 
      setHasNextPage(initialState.initialHasNextPage); 
      isInitialMount.current = false; 
      return;
    }
    
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    
    fetchGames(currentPage);
  }, [currentPage, fetchGames, initialState.initialGames.length, initialState.initialHasNextPage]);

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
        case "released":
          const dateA = a.released ? new Date(a.released).getTime() : 0;
          const dateB = b.released ? new Date(b.released).getTime() : 0;
          return dateB - dateA;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "metacritic":
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
    if (!loading && hasPreviousPage && currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  if (loading && filteredGames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen p-8 bg-slate-950 text-gray-100">
        <LoadingSpinner />
        <p className="mt-4 text-lg">Loading games...</p>
      </div>
    );
  }

  if (error && filteredGames.length === 0) {
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
        !loading && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
            <p className="text-lg">No games found matching your criteria.</p>
            {currentPage > MAX_GAME_PAGES && (
                <p className="text-sm mt-2 text-gray-500">You&apos;ve reached the end of available pages.</p>
            )}
          </div>
        )
      )}

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

      {loading && filteredGames.length > 0 && (
        <div className="flex justify-center py-4">
            <LoadingSpinner className="text-blue-500 w-8 h-8" />
        </div>
      )}
    </div>
  );
};

export default GamesList;