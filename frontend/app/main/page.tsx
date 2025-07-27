// frontend/app/MainPage.tsx

import React from 'react'
import LeftSideBar from '../components/ui/navigation/LeftSideBar';
import GamesList from '../components/ui/games/GamesList';
import MainNavBar from '../components/ui/navigation/MainNavBar'; // Ensure MainNavBar is imported if used

const MainPage = () => {

  return (
    // Outer container:
    // `flex h-screen`: Standard setup for sidebar + main content.
    // `min-w-min`: This is crucial. It tells the browser that this element should not shrink below
    //              the intrinsic minimum width of its content. This effectively creates a global minimum width
    //              for your entire visible page content.
    <div className="flex h-screen min-w-min"> {/* Kept min-w-min here */}
      {/* LeftSideBar no longer needs width classes passed directly, it handles its own responsiveness */}
      <LeftSideBar />

      {/* The main content area:
          `flex-1`: Takes remaining horizontal space.
          `overflow-auto`: Scrollbars appear *within* this area if content overflows.
          `min-w-0`: Allows it to shrink.
      */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* MainNavBar is expected to be a full-width header within the scrollable main content */}
        {/* Make sure to render MainNavBar if it's meant to be here */}
        <GamesList />
      </main>
    </div>
  );
}

export default MainPage;