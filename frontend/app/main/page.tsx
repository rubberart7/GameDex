
import React from 'react'
import LeftSideBar from '../components/ui/navigation/LeftSideBar';
import GamesList from '../components/ui/games/GamesList';

const MainPage = () => {

  return (
    <div className="flex h-screen min-w-min"> 
      <LeftSideBar />
      <main className="flex-1 overflow-auto min-w-0">
        <GamesList />
      </main>
    </div>
  );
}

export default MainPage;