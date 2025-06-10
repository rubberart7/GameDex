import React from 'react';
import Link from 'next/link';
import StoreIcon from '../icons/StoreIcon';
import TopSellersIcon from '../icons/TopSellersIcon';
import UpcomingGamesIcon from '../icons/UpcomingGamesIcon';
import DealsIcon from '../icons/DealsIcon';
import ProfileIcon from '../icons/ProfileIcon';
import WishListIcon from '../icons/WishListIcon';
import LibraryIcon from '../icons/LibraryIcon';
import SettingsIcon from '../icons/SettingsIcon';
import HomeIcon from '../icons/HomeIcon';
import BrowseGamesIcon from '../icons/BrowseGamesIcon';
import NewReleasesIcon from '../icons/NewReleasesIcon';
import ProjectLogo from '../icons/ProjectLogo';
import LoginIcon from '../icons/LoginIcon';

const LeftSideBar = () => {
  return (
    <div
      className="w-110 h-screen text-gray-100 flex flex-col px-6 py-7"
      style={{
        background: `linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)`,
        boxShadow: '4px 0 12px 0 rgba(0, 0, 0, 0.75)', // soft shadow on right edge
      }}
    >
      <div className='logo-div flex justify-center'>
        <ProjectLogo></ProjectLogo>
      </div>
      
      <div className="w-full h-0.75 bg-sky-900 mb-8 rounded-full" />

      <nav className="full-navbar flex flex-col pb-12 gap-10">
        <ul className="nav-top flex flex-col gap-6">
          <li className="full-link-itm flex gap-2 items-center" key="Home">
            <HomeIcon className="side-bar-icon h-6 w-6" />
            <Link href="/home"className="text-lg">Home</Link>
          </li>

          {/* <li className="full-link-itm flex gap-2 items-center" key="Store">
            <StoreIcon className="side-bar-icon h-6 w-6" />
            <Link href="/store">Store</Link>
          </li> */}

          <li
            className="full-link-itm flex gap-2 items-center"
            key="Browse Games"
          >
            <BrowseGamesIcon className="side-bar-icon h-7 w-7" />
            <Link href="/browse-games"className="text-lg">Browse Games</Link>
          </li>

          {/* <li
            className="full-link-itm flex gap-2 items-center"
            key="New Releases"
          >
            <NewReleasesIcon className="side-bar-icon h-6 w-6" />
            <Link href="/new-releases"className="text-lg">New Releases</Link>
          </li>

          <li
            className="full-link-itm flex gap-2 items-center"
            key="Top Sellers"
          >
            <TopSellersIcon className="side-bar-icon h-6 w-6" />
            <Link href="/top-sellers"className="text-lg">Top Sellers</Link>
          </li> */}

          {/* <li
            className="full-link-itm flex gap-2 items-center"
            key="Upcoming Games"
          >
            <UpcomingGamesIcon className="side-bar-icon h-6 w-6" />
            <Link href="/upcoming-games">Upcoming Games</Link>
          </li> */}

          <li className="full-link-itm flex gap-2 items-center" key="Deals">
            <DealsIcon className="side-bar-icon h-6 w-6" />
            <Link href="/deals"className="text-lg">Deals</Link>
          </li>
        </ul>

        <ul className="nav-bottom flex flex-col gap-6">
          <li className="full-link-itm flex gap-2 items-center" key="Profile">
            <ProfileIcon className="side-bar-icon h-6 w-6" />
            <Link href="/profile"className="text-lg">Profile</Link>
          </li>

          {/* <li className="full-link-itm flex gap-2 items-center" key="Wishlist">
            <WishListIcon className="side-bar-icon h-6 w-6" />
            <Link href="/wishlist">WishList</Link>
          </li> */}

          <li className="full-link-itm flex gap-2 items-center" key="Library">
            <LibraryIcon className="side-bar-icon h-6 w-6" />
            <Link href="/library"className="text-lg">Library</Link>
          </li>

          <li className="full-link-itm flex gap-2 items-center" key="Settings">
            <SettingsIcon className="side-bar-icon h-6 w-6" />
            <Link href="/settings"className="text-lg">Settings</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default LeftSideBar;
