import React from 'react';
import Link from 'next/link';
import HomeIcon from './icons/HomeIcon';
import BrowseGamesIcon from './icons/BrowseGamesIcon';

const LeftSideBar = () => {
    const navTopLinks = [
  { name: 'Home', path: '/home' },
  { name: 'Store', path: '/store' },
  { name: 'Browse Games', path: '/browse-games'},
  { name: 'Genres', path: '/genres' },
  { name: 'New Releases', path: '/new-releases' },
  { name: 'Top Sellers', path: '/top-sellers' },
  { name: 'Upcoming Games', path: '/upcoming-games' },
  { name: 'Free Games', path: '/free-games' },
];

const navBottomLinks = [
  { name: 'Profile', path: '/profile' },
  { name: 'Wishlist', path: '/wishlist' },
  { name: 'Library', path: '/library' },
  { name: 'Settings', path: '/settings' },
];


  return (
    <div className='w-60 h-screen bg-gray-900 text-gray-100 flex flex-col px-4 py-7'>
      <nav className='full-navbar flex flex-col pb-12 gap-40'>
        <ul className='nav-top flex flex-col gap-3'>
          {navTopLinks.map((link) => (
            <li className="flex gap-1" key={link.path}>
                <BrowseGamesIcon className="w-5 h-5 text-white"></BrowseGamesIcon>
              <Link href={link.path}>{link.name}</Link>
            </li>
          ))}
        </ul>
        

        <ul className='nav-bottom flex flex-col gap-3'>
          {navBottomLinks.map((link) => (
            <li className="flex gap-1"key={link.path}>
                
              <Link href={link.path}>{link.name}</Link>
            </li>
          ))}
        </ul>

      </nav>
    </div>
  );
};

export default LeftSideBar;
