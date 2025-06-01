// components/GamesList.tsx
import React from 'react';
import GameCard, { Game } from './GameCard';

const GamesList = async () => {
  // Fetch games on server
  const res = await fetch('http://localhost:4000/api/games', { cache: 'no-store' }); // no-store to disable caching during dev
  if (!res.ok) {
    throw new Error('Failed to fetch games');
  }
  const data = await res.json();

  const games: Game[] = data.results;

  return (
    <div className="games-list grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-1 p-4">
      {games.map((game) => (
        <GameCard key={game.name} game={game} />
      ))}
    </div>
  );
};

export default GamesList;
