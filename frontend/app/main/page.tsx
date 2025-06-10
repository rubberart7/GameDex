import React from 'react'
import LeftSideBar from '../components/ui/LeftSideBar';
import GamesList from '../components/ui/GamesList';

const MainPage = () => {

  return (
    <div className="flex h-screen">
      <LeftSideBar />
      <main className="flex-1 overflow-auto">
        <GamesList />
      </main>
    </div>
  );
  
  
}

export default MainPage
