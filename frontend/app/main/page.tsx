import React from 'react'
import LeftSideBar from '../components/LeftSideBar';
import GamesList from '../components/GamesList';

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
