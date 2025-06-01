import React from 'react';
import GamesList from './components/GamesList';
import LeftSideBar from './components/LeftSideBar';

export default function Home() {
  return (
    <div className="flex h-screen">
      <LeftSideBar />
      <main className="flex-1 overflow-auto">
        <GamesList />
      </main>
    </div>
  );
}
