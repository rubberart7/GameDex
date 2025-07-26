// frontend/app/game-details/[id]/page.tsx
"use client"; // This component will likely need to be a Client Component to use `useParams`

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // For Next.js App Router
// Adjust paths based on your current components folder structure:
import GameDetailsCard from '../../components/ui/games/GameDetailsCard';
import MainNavBar from '../../components/ui/navigation/MainNavBar';

const GameDetailsPage = () => {
  const params = useParams();
  const gameId = params.id as string; // Get the game ID from the URL parameter

  const [gameData, setGameData] = useState<any | null>(null); // Use 'any' or define a more complete interface for GameDetails
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      setError("Game ID not provided.");
      return;
    }

    const fetchGameDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        // Make sure your backend has an endpoint like /api/games/:id
        const res = await fetch(`http://localhost:4000/api/games/game/${gameId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch game details: ${res.statusText}`);
        }
        const data = await res.json();
        setGameData(data);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameId]); // Re-run effect if gameId changes

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-gray-100">
        Loading game details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-red-400">
        Error: {error}
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-gray-400">
        Game not found.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 overflow-auto">
        <MainNavBar />
        <GameDetailsCard game={gameData} />
      </main>
    </div>
  );
};

export default GameDetailsPage;