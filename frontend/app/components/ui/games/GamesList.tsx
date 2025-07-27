// frontend/app/components/ui/games/GamesList.tsx

"use client"; 

import React, { useState, useEffect } from 'react';
import GameCard, { Game } from './GameCard';
import LoadingSpinner from '@/app/components/ui/common/LoadingSpinner';

// Define constants for caching
const CACHE_KEY = 'cachedGamesList';
const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour in milliseconds (adjust as needed)

const GamesList = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);

        // --- 1. Try to load from cache ---
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          try {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
              // Cache is valid
              setGames(data);
              setLoading(false);
              console.log("Games loaded from cache.");
              return; // Exit, no need to fetch from API
            } else {
              console.log("Cached games expired, fetching new data.");
            }
          } catch (e) {
            console.error("Failed to parse cached data:", e);
            localStorage.removeItem(CACHE_KEY); // Clear invalid cache
          }
        }

        // --- 2. Fetch from API if cache is not valid or not found ---
        console.log("Fetching games from API...");
        const res = await fetch('http://localhost:4000/api/games');
        if (!res.ok) {
          throw new Error(`Failed to fetch games: ${res.statusText}`);
        }
        const data = await res.json();
        setGames(data.results);

        // --- 3. Store in cache ---
        try {
          const dataToCache = {
            data: data.results,
            timestamp: Date.now(),
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
          console.log("Games fetched and cached.");
        } catch (e) {
          console.error("Failed to cache games data:", e);
          // Don't block if caching fails, just log it.
        }

      } catch (err: any) {
        console.error("Error fetching games:", err);
        setError(err.message || "An unknown error occurred while fetching games.");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []); // Empty dependency array means this effect runs once on mount

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

  if (games.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8 bg-slate-950 text-gray-400">
        <p className="text-lg">No games found.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 p-4
                    sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] sm:gap-6 sm:p-6
                    lg:grid-cols-[repeat(auto-fill,minmax(205px,1fr))] lg:gap-8 lg:p-8">
      {games.map((game) => (
        <GameCard key={game.id} game={game}/>
      ))}
    </div>
  );
};

export default GamesList;