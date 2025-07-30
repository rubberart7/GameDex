import React from 'react';
import ProjectLogo from '../../icons/ProjectLogo';
import Link from 'next/link';
import DealsIcon from '../../icons/DealsIcon';
import LibraryIcon from '../../icons/LibraryIcon';
import SettingsIcon from '../../icons/SettingsIcon';
import HomeIcon from '../../icons/HomeIcon';
import BrowseGamesIcon from '../../icons/BrowseGamesIcon';
import WishListIcon from '../../icons/WishListIcon';

const MainNavBar = () => {
  return (
    <nav
        style={{
        backgroundColor: "#0b1226",
        
        }}
        className="h-24 nav-lines flex items-center justify-center gap-80"
    >
        <ProjectLogo></ProjectLogo>

        <section className="flex gap-0.5">
            
            <Link href="/" key="Home" className="new-link-itm flex items-center text-lg gap-2">
                <HomeIcon className="side-bar-icon h-6 w-6" />
                Home
            </Link>

            <Link href="/main" key="Browse Games" className="new-link-itm flex items-center text-lg gap-2">
                <BrowseGamesIcon className="side-bar-icon h-7 w-7" />
                Browse Games
            </Link>

            <Link href="/deals" key="Deals" className="new-link-itm flex items-center text-lg gap-2">
                <DealsIcon className="side-bar-icon h-6 w-6" />
                Deals
            </Link>

            <Link href="/wishlist" key="WishList" className="new-link-itm flex items-center text-lg gap-2">
                <WishListIcon className="side-bar-icon h-6 w-6" />
                WishList
            </Link>

            <Link href="/games-library" key="Library" className="new-link-itm flex items-center text-lg gap-2">
                <LibraryIcon className="side-bar-icon h-6 w-6" />
                Library
            </Link>

            

            <Link href="/settings" key="Settings" className="new-link-itm flex items-center text-lg gap-2">
                <SettingsIcon className="side-bar-icon h-6 w-6" />
                Settings
            </Link>

      </section>
        
    </nav>

  )
}

export default MainNavBar;
