'use client';
import React, { useEffect, useState } from 'react';
import GameCard, { Game } from './GameCard';

const GamesList: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch('http://localhost:4000/api/games');
        const data = await res.json();
        setGames(data.results);
      } catch (error) {
        console.error('Failed to fetch games', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="games-list grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {games.map((game) => (
        <GameCard key={game.name} game={game} />
      ))}
    </div>
  );
};

export default GamesList;
