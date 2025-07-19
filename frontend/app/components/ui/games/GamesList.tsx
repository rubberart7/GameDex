import React from 'react';
import GameCard, { Game } from './GameCard';

const GamesList = async () => {
//   1. How it's connected to the backend
// This line:
// const res = await fetch('http://localhost:4000/api/games');
// Makes a GET request to your Express backend.

  const res = await fetch('http://localhost:4000/api/games'); 
  if (!res.ok) {
    throw new Error('Failed to fetch games');
  }
  const data = await res.json();

  const games: Game[] = data.results;
  // make the games into an array of Game props so that GameCard can recieve it as a prop

  return (
    <div className="games-list bg-slate-950 grid grid-cols-[repeat(auto-fit,minmax(205px,1fr))] gap-8 p-10">
      {games.map((game) => (
        <GameCard key={game.name} game={game}/>
      ))}
    </div>
  );
};

export default GamesList;
