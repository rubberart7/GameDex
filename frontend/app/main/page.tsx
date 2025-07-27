// frontend/app/MainPage.tsx

import React from 'react'
import LeftSideBar from '../components/ui/navigation/LeftSideBar';
import GamesList from '../components/ui/games/GamesList';
import HomeNavBar from '../components/ui/navigation/HomeNavBar';

const MainPage = () => {

  return (
    // This outer div sets up the main flex container for the sidebar and main content.
    // `flex` defaults to `flex-row`, laying children out horizontally.
    // `h-screen` makes it take the full viewport height.
    <div className="flex h-screen">
      {/* LeftSideBar is assumed to have its own defined width (e.g., w-64, or responsive widths like md:w-64)
        It typically does *not* have flex-1 so it retains its size.
        If your LeftSideBar is causing horizontal overflow, you might need to
        add 'flex-shrink-0' and/or responsive width classes (e.g., w-full sm:max-w-xs md:max-w-sm)
        directly within LeftSideBar.tsx, or here if you want to control its size from parent.
        For now, assuming LeftSideBar manages its own width.
      */}
      <LeftSideBar />

      {/* The main content area takes up the remaining horizontal space.
        `flex-1`: This makes the <main> element grow and shrink to fill available space.
                  It's crucial for responsive layouts next to a fixed-width sidebar.
        `overflow-auto`: This ensures that if the content inside <main> (i.e., GamesList)
                         is wider or taller than the <main> element itself, scrollbars will
                         appear *only within* the <main> element, not on the entire page.
        `min-w-0`: This is a crucial flexbox property. By default, flex items have a
                   `min-width: auto;` which can prevent them from shrinking below their
                   content's intrinsic width. `min-w-0` allows the element to shrink
                   as much as needed by the flex container, preventing overflow.
                   This is a common fix for horizontal scrollbars in flex layouts.
      */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* MainNavBar is expected to be a full-width header within the scrollable main content */}
        {/* GamesList will now render within this scrollable main area */}
        <GamesList />
      </main>
    </div>
  );
}

export default MainPage;