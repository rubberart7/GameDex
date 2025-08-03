// frontend/app/components/ui/games/GamesList.tsx

"use client";

import React, { useState, useEffect } from 'react';
import GameCard, { Game } from './GameCard'; // Ensure Game interface is imported
import LoadingSpinner from '@/app/components/ui/common/LoadingSpinner';

const CACHE_KEY = 'cachedGamesList';
const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour in milliseconds (adjust as needed)

const GamesList = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('released'); // Default sort by release date
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);

  // Hardcoded filter options for demonstration
  // Using RAWG genre slugs for accurate filtering
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
    // Add more categories as needed, ensuring 'slug' matches RAWG API
  ];

  const sortOptions = [
    { name: 'Release Date (Newest)', value: 'released' },
    { name: 'Name (A-Z)', value: 'name-asc' },
    { name: 'Name (Z-A)', value: 'name-desc' },
    { name: 'Metacritic Score (Highest)', value: 'metacritic' },
  ];

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);

        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          try {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
              setGames(data);
              setLoading(false);
              console.log("Games loaded from cache.");
              return;
            } else {
              console.log("Cached games expired, fetching new data.");
            }
          } catch (e) {
            console.error("Failed to parse cached data:", e);
            localStorage.removeItem(CACHE_KEY);
          }
        }

        console.log("Fetching games from API...");
        const res = await fetch('http://localhost:4000/api/games');
        if (!res.ok) {
          throw new Error(`Failed to fetch games: ${res.statusText}`);
        }
        const data = await res.json();
        // Ensure that the 'genres' property exists and is an array in the fetched data
        const gamesWithGenres = data.results.map((game: any) => ({
          ...game,
          genres: game.genres || [], // Ensure genres is an array, default to empty
        }));
        setGames(gamesWithGenres);

        try {
          const dataToCache = {
            data: gamesWithGenres, // Cache the processed data
            timestamp: Date.now(),
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
          console.log("Games fetched and cached.");
        } catch (e) {
          console.error("Failed to cache games data:", e);
        }

      } catch (err: any) {
        console.error("Error fetching games:", err);
        setError(err.message || "An unknown error occurred while fetching games.");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    let currentGames = [...games];

    // 1. Filter by Search Term
    if (searchTerm) {
      currentGames = currentGames.filter(game =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Filter by Category
    if (selectedCategory) {
      currentGames = currentGames.filter(game =>
        game.genres && game.genres.some(genre => genre.slug === selectedCategory)
      );
    }

    // 3. Sort
    currentGames.sort((a, b) => {
      switch (selectedSort) {
        case 'released':
          // Sort in descending order (newest first). Handle potential null/undefined dates.
          const dateA = a.released ? new Date(a.released).getTime() : 0;
          const dateB = b.released ? new Date(b.released).getTime() : 0;
          return dateB - dateA;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'metacritic':
          // Sort by metacritic score, higher first. Handle nulls safely.
          return (b.metacritic || 0) - (a.metacritic || 0);
        default:
          return 0;
      }
    });

    setFilteredGames(currentGames);
  }, [games, searchTerm, selectedCategory, selectedSort]);


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-950 text-gray-100">
        <LoadingSpinner />
        <p className="mt-4 text-lg">Loading games...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8 bg-slate-950 text-red-400">
        <p className="text-lg">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Top Bar with Search and Sort */}
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
          {/* Category Filter Dropdown */}
          <select
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.slug} value={category.slug}>{category.name}</option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <select
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {filteredGames.length === 0 && !loading && (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p className="text-lg">No games found matching your criteria.</p>
        </div>
      )}

      {/* Crucial change: Add `min-w-0` to the grid container itself.
          This allows the grid to shrink beyond its ideal `minmax` if the parent demands it,
          making it fit inside the available space, and letting `overflow-auto` do its job.
          Also slightly adjusted minmax and gap for very small screens for better density. */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3
                      sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] sm:gap-4
                      md:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] md:gap-6
                      lg:grid-cols-[repeat(auto-fill,minmax(205px,1fr))] lg:gap-8
                      min-w-0">
        {filteredGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};

export default GamesList;