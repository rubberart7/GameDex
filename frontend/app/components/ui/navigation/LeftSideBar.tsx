import React from 'react';
import Link from 'next/link';
import DealsIcon from '../../icons/DealsIcon';
import ProfileIcon from '../../icons/ProfileIcon';
import LibraryIcon from '../../icons/LibraryIcon';
import SettingsIcon from '../../icons/SettingsIcon';
import HomeIcon from '../../icons/HomeIcon';
import BrowseGamesIcon from '../../icons/BrowseGamesIcon';
import ProjectLogo from '../../icons/ProjectLogo';
import WishListIcon from '../../icons/WishListIcon';

interface LeftSideBarProps {
  className?: string;
}

const LeftSideBar: React.FC<LeftSideBarProps> = ({ className }) => {
  return (
    <div
      // Set a wider, consistent width
      className={`h-screen text-gray-100 flex flex-col px-6 py-7 flex-shrink-0 min-w-min w-[27.5rem] ${className || ''}`}
      style={{
        background: `linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)`,
        boxShadow: '4px 0 12px 0 rgba(0, 0, 0, 0.75)',
      }}
    >
      <div className="logo-div flex justify-center pb-10 pt-5">
        <ProjectLogo />
      </div>

      <div className="w-full h-0.75 bg-sky-900 mb-8 rounded-full" />

      <nav className="full-navbar flex flex-col pb-12 gap-15">
        <ul className="nav-top flex flex-col gap-6">
          <Link href="/" key="Home" className="full-link-itm flex gap-2 items-center text-lg">
            <HomeIcon className="side-bar-icon h-6 w-6" />
            <span className="whitespace-nowrap">Home</span>
          </Link>

          <Link href="/main" key="Browse Games" className="full-link-itm flex gap-2 items-center text-lg">
            <BrowseGamesIcon className="side-bar-icon h-7 w-7" />
            <span className="whitespace-nowrap text-base sm:text-lg">Browse Games</span>
          </Link>

          <Link href="/deals" key="Deals" className="full-link-itm flex gap-2 items-center text-lg">
            <DealsIcon className="side-bar-icon h-6 w-6" />
            <span className="whitespace-nowrap">Deals</span>
          </Link>

          <Link href="/wishlist" key="WishList" className="full-link-itm flex gap-2 items-center text-lg">
            <WishListIcon className="side-bar-icon h-6 w-6" />
            <span className="whitespace-nowrap">WishList</span>
          </Link>

        </ul>

        <ul className="nav-bottom flex flex-col gap-6">
          <Link href="/profile" key="Profile" className="full-link-itm flex gap-2 items-center text-lg">
            <ProfileIcon className="side-bar-icon h-6 w-6" />
            <span className="whitespace-nowrap">Profile</span>
          </Link>

          <Link href="/games-library" key="Library" className="full-link-itm flex gap-2 items-center text-lg">
            <LibraryIcon className="side-bar-icon h-6 w-6" />
            <span className="whitespace-nowrap">Library</span>
          </Link>

          <Link href="/settings" key="Settings" className="full-link-itm flex gap-2 items-center text-lg">
            <SettingsIcon className="side-bar-icon h-6 w-6" />
            <span className="whitespace-nowrap">Settings</span>
          </Link>
        </ul>
      </nav>
    </div>
  );
};

export default LeftSideBar;
