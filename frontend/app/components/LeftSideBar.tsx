import React from 'react';
import Link from 'next/link';
import StoreIcon from './icons/StoreIcon';
import TopSellersIcon from './icons/TopSellersIcon';
import UpcomingGamesIcon from './icons/UpcomingGamesIcon';
import DealsIcon from './icons/DealsIcon';
import ProfileIcon from './icons/ProfileIcon';
import WishListIcon from './icons/WishListIcon';
import LibraryIcon from './icons/LibraryIcon';
import SettingsIcon from './icons/SettingsIcon';
import HomeIcon from './icons/HomeIcon';
import BrowseGamesIcon from './icons/BrowseGamesIcon';
import NewReleasesIcon from './icons/NewReleasesIcon';

const LeftSideBar = () => {

  return (
    <div className='w-60 h-screen bg-gray-900 text-gray-100 flex flex-col px-6 py-7'>
      <nav className='full-navbar flex flex-col pb-12 gap-70'>
        <ul className='nav-top flex flex-col gap-5'>
          <li className="full-link-itm flex gap-2 items-center" key='Home'>
              <HomeIcon className="h-6 w-6"></HomeIcon>
              <Link href='/home'>Home</Link>
          </li>

          <li className="full-link-itm flex gap-2 items-center" key='Store'>
              <StoreIcon className="h-6 w-6"></StoreIcon>
              <Link href='/store'>Store</Link>
          </li>

          <li className="full-link-itm flex gap-2 items-center" key='Browse Games'>
              <BrowseGamesIcon className="h-6 w-6"></BrowseGamesIcon>
              <Link href='/browse-games'>Browse Games</Link>
          </li>

          <li className="full-link-itm flex gap-2 items-center" key='New Releases'>
              <NewReleasesIcon className="h-6 w-6"></NewReleasesIcon>
              <Link href='/new-releases'>New Releases</Link>
          </li>

          <li className="full-link-itm flex gap-2 items-center" key='Top Sellers'>
              <TopSellersIcon className="h-6 w-6"></TopSellersIcon>
              <Link href='/top-sellers'>Top Sellers</Link>
          </li>

          <li className="full-link-itm flex gap-2 items-center" key='Upcoming Games'>
              <UpcomingGamesIcon className="h-6 w-6"></UpcomingGamesIcon>
              <Link href='/upcoming-games'>Upcoming Games</Link>
          </li>

          <li className="full-link-itm flex gap-2 items-center" key='Deals'>
              <DealsIcon className="h-6 w-6"></DealsIcon>
              <Link href='/deals'>Deals</Link>
          </li>

        </ul>
        

        <ul className='nav-bottom flex flex-col gap-5'>
          <li className="full-link-itm flex gap-2 items-center" key='Profile'>
              <ProfileIcon className="h-6 w-6"></ProfileIcon>
              <Link href='/profile'>Profile</Link>
          </li>

          <li className="full-link-itm flex gap-2 items-center" key='Wishlist'>
              <WishListIcon className="h-6 w-6"></WishListIcon>
              <Link href='/wishlist'>WishList</Link>
          </li>

          <li className="full-link-itm flex gap-2 items-center" key='Library'>
              <LibraryIcon className="h-6 w-6"></LibraryIcon>
              <Link href='/library'>Library</Link>
          </li>

          <li className="full-link-itm flex gap-2 items-center" key='Settings'>
              <SettingsIcon className="h-6 w-6"></SettingsIcon>
              <Link href='/settings'>Settings</Link>
          </li>

          

        </ul>

      </nav>
    </div>
  );
};

export default LeftSideBar;
