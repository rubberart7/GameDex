import React from 'react';
import GameCard, { Game } from './GameCard';

const GamesList = async () => {
  const res = await fetch('http://localhost:4000/api/games'); 
  if (!res.ok) {
    throw new Error('Failed to fetch games');
  }
  const data = await res.json();

  const games: Game[] = data.results;

  return (
    <div className="games-list bg-slate-950 grid grid-cols-[repeat(auto-fit,minmax(175px,1fr))] gap-4 p-4">
      {games.map((game) => (
        <GameCard key={game.name} game={game} />
      ))}
    </div>
  );
};

export default GamesList;
