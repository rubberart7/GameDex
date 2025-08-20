
"use client"; 

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import GameDetailsCard from '../../components/ui/games/GameDetailsCard';
import MainNavBar from '../../components/ui/navigation/MainNavBar';
import LoadingSpinner from '@/app/components/ui/common/LoadingSpinner';
import { GameDetails } from '../../components/ui/games/GameDetailsCard';



const GameDetailsPage = () => {
  const params = useParams();
  const gameId = params.id as string; 

  const [gameData, setGameData] = useState<GameDetails | null>(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

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
        const res = await fetch(`${serverUrl}api/games/game/${gameId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch game details: ${res.statusText}`);
        }
        const data = await res.json();
        setGameData(data);
      } catch (err: unknown) {
        console.log("Error: ", err);
        setError("An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameId]); 
  if (loading) {
    return (
      <div className="flex gap-2 h-screen items-center justify-center bg-gray-950 text-gray-100">
        <LoadingSpinner></LoadingSpinner>
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