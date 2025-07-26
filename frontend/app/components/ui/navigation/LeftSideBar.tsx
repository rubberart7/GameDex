import React from 'react';
import Link from 'next/link';
// import StoreIcon from '../icons/StoreIcon';
// import TopSellersIcon from '../icons/TopSellersIcon';
// import UpcomingGamesIcon from '../icons/UpcomingGamesIcon';
import DealsIcon from '../../icons/DealsIcon';
import ProfileIcon from '../../icons/ProfileIcon';
// import WishListIcon from '../icons/WishListIcon';
import LibraryIcon from '../../icons/LibraryIcon';
import SettingsIcon from '../../icons/SettingsIcon';
import HomeIcon from '../../icons/HomeIcon';
import BrowseGamesIcon from '../../icons/BrowseGamesIcon';
// import NewReleasesIcon from '../icons/NewReleasesIcon';
import ProjectLogo from '../../icons/ProjectLogo';
// import LoginIcon from '../icons/LoginIcon';

const LeftSideBar = () => {
  return (
    <div
      className="w-110 h-screen text-gray-100 flex flex-col px-6 py-7"
      style={{
        background: `linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)`,
        boxShadow: '4px 0 12px 0 rgba(0, 0, 0, 0.75)',
      }}
    >
      <div className="logo-div flex justify-center">
        <ProjectLogo />
      </div>

      <div className="w-full h-0.75 bg-sky-900 mb-8 rounded-full" />

      <nav className="full-navbar flex flex-col pb-12 gap-10">
        <ul className="nav-top flex flex-col gap-6">
          <Link href="/" key="Home" className="full-link-itm flex gap-2 items-center text-lg">
            <HomeIcon className="side-bar-icon h-6 w-6" />
            Home
          </Link>

          {/* <Link href="/store" key="Store" className="full-link-itm flex gap-2 items-center text-lg">
            <StoreIcon className="side-bar-icon h-6 w-6" />
            Store
          </Link> */}

          <Link href="/main" key="Browse Games" className="full-link-itm flex gap-2 items-center text-lg">
            <BrowseGamesIcon className="side-bar-icon h-7 w-7" />
            Browse Games
          </Link>

          {/* <Link href="/new-releases" key="New Releases" className="full-link-itm flex gap-2 items-center text-lg">
            <NewReleasesIcon className="side-bar-icon h-6 w-6" />
            New Releases
          </Link>

          <Link href="/top-sellers" key="Top Sellers" className="full-link-itm flex gap-2 items-center text-lg">
            <TopSellersIcon className="side-bar-icon h-6 w-6" />
            Top Sellers
          </Link> */}

          {/* <Link href="/upcoming-games" key="Upcoming Games" className="full-link-itm flex gap-2 items-center text-lg">
            <UpcomingGamesIcon className="side-bar-icon h-6 w-6" />
            Upcoming Games
          </Link> */}

          <Link href="/deals" key="Deals" className="full-link-itm flex gap-2 items-center text-lg">
            <DealsIcon className="side-bar-icon h-6 w-6" />
            Deals
          </Link>
        </ul>

        <ul className="nav-bottom flex flex-col gap-6">
          <Link href="/profile" key="Profile" className="full-link-itm flex gap-2 items-center text-lg">
            <ProfileIcon className="side-bar-icon h-6 w-6" />
            Profile
          </Link>

          {/* <Link href="/wishlist" key="Wishlist" className="full-link-itm flex gap-2 items-center text-lg">
            <WishListIcon className="side-bar-icon h-6 w-6" />
            WishList
          </Link> */}

          <Link href="/games-library" key="Library" className="full-link-itm flex gap-2 items-center text-lg">
            <LibraryIcon className="side-bar-icon h-6 w-6" />
            Library
          </Link>

          <Link href="/settings" key="Settings" className="full-link-itm flex gap-2 items-center text-lg">
            <SettingsIcon className="side-bar-icon h-6 w-6" />
            Settings
          </Link>
        </ul>
      </nav>
    </div>
  );
};

export default LeftSideBar;
