import React from 'react';
import Link from 'next/link';
import GenresIcon from './icons/LibraryIcon';
import StoreIcon from './icons/StoreIcon';
import TopSellersIcon from './icons/TopSellersIcon';
import UpcomingGamesIcon from './icons/UpcomingGamesIcon';
import DealsIcon from './icons/DealsIcon';
import ProfileIcon from './icons/ProfileIcon';
import WishListIcon from './icons/WishListIcon';
import LibraryIcon from './icons/LibraryIcon';
import SettingsIcon from './icons/SettingsIcon';

const LeftSideBar = () => {
  const navTopLinks = [
    { name: 'Home', path: '/home'},
    { name: 'Store', path: '/store' },
    { name: 'Browse Games', path: '/browse-games'},
    { name: 'New Releases', path: '/new-releases' },
    { name: 'Top Sellers', path: '/top-sellers' },
    { name: 'Upcoming Games', path: '/upcoming-games' },
    { name: 'Deals', path: '/deals' },
  ];

  const navBottomLinks = [
    { name: 'Profile', path: '/profile' },
    { name: 'Wishlist', path: '/wishlist' },
    { name: 'Library', path: '/library' },
    { name: 'Settings', path: '/settings' },
  ];


  return (
    <div className='w-60 h-screen bg-gray-900 text-gray-100 flex flex-col px-6 py-7'>
      <nav className='full-navbar flex flex-col pb-12 gap-40'>
        <ul className='nav-top flex flex-col gap-3'>
          {navTopLinks.map((link) => (
            <li className="full-link-itm flex gap-2 items-center" key={link.name}>
              <LibraryIcon className="h-4 w-4"></LibraryIcon>
              <Link href={link.path}>{link.name}</Link>
            </li>
          ))}
        </ul>
        

        <ul className='nav-bottom flex flex-col gap-3'>
          {navBottomLinks.map((link) => (
            <li className="flex gap-2 items-center"key={link.path}>
                <SettingsIcon className="h-4 w-4"></SettingsIcon>
              <Link href={link.path}>{link.name}</Link>
            </li>
          ))}
        </ul>

      </nav>
    </div>
  );
};

export default LeftSideBar;
