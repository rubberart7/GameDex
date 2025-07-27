// frontend/app/components/ui/games/GamesList.tsx

"use client"; 

import React, { useState, useEffect } from 'react';
import GameCard, { Game } from './GameCard';
import LoadingSpinner from '@/app/components/ui/common/LoadingSpinner';

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
        setGames(data.results);

        try {
          const dataToCache = {
            data: data.results,
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
    // Crucial change: Add `min-w-0` to the grid container itself.
    // This allows the grid to shrink beyond its ideal `minmax` if the parent demands it,
    // making it fit inside the available space, and letting `overflow-auto` do its job.
    // Also slightly adjusted minmax and gap for very small screens for better density.
    <div className="bg-slate-950 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 p-3
                    sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] sm:gap-4 sm:p-4
                    md:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] md:gap-6 md:p-6
                    lg:grid-cols-[repeat(auto-fill,minmax(205px,1fr))] lg:gap-8 lg:p-8
                    min-w-0"> {/* <-- THIS IS THE KEY ADDITION */}
      {games.map((game) => (
        <GameCard key={game.id} game={game}/>
      ))}
    </div>
  );
};

export default GamesList;