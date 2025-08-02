'use client'; // This directive makes the component a Client Component

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Import your consistent icons
import DealsIcon from '../../icons/DealsIcon';
import ProfileIcon from '../../icons/ProfileIcon';
import LibraryIcon from '../../icons/LibraryIcon';
import SettingsIcon from '../../icons/SettingsIcon';
import HomeIcon from '../../icons/HomeIcon';
import BrowseGamesIcon from '../../icons/BrowseGamesIcon';
import ProjectLogo from '../../icons/ProjectLogo';
import WishListIcon from '../../icons/WishListIcon';
import RecommendationsIcon from '../../icons/RecommendationsIcon';

interface LeftSideBarProps {
  className?: string;
}

const LeftSideBar: React.FC<LeftSideBarProps> = ({ className }: LeftSideBarProps) => {
  const pathname = usePathname();

  // The isActive function is no longer used for visual highlighting
  // private const isActive = (path: string) => pathname === path;

  return (
    <div
      className={`h-screen text-gray-100 flex flex-col px-6 py-7 flex-shrink-0 w-80 ${className || ''}`}
      style={{
        background: `linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)`,
        boxShadow: '4px 0 12px 0 rgba(0, 0, 0, 0.75)',
      }}
    >
      {/* Logo Section */}
      <div className="flex justify-center pb-8 pt-2 mt-5">
        <ProjectLogo />
      </div>

      {/* Separator Line - Lighter Blue */}
      <div className="w-full h-0.5 bg-blue-700 mb-8 rounded-full" />

      {/* Main Navigation */}
      <nav className="flex flex-col flex-grow gap-10 mt-10">
        <ul className="flex flex-col gap-4">
          {[
            { href: '/', label: 'Home', Icon: HomeIcon },
            { href: '/main', label: 'Browse Games', Icon: BrowseGamesIcon },
            { href: '/deals', label: 'Deals', Icon: DealsIcon },
          ].map((item) => (
            <Link
              href={item.href}
              key={item.label}
              className={`
                flex items-center gap-6 py-2 px-3 rounded-lg transition-all duration-200
                text-gray-300 // Default text color
                focus:outline-none focus:bg-gray-700 focus:text-white // Gray glow on focus (keyboard navigation)
                hover:bg-gray-700 hover:text-white // Gray glow ONLY on hover
              `}
            >
              <item.Icon className="h-6 w-6" />
              <span className="text-lg font-medium whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </ul>

        {/* Larger gap between the top and bottom groups */}
        <div className="h-8 w-full" />

        {/* Secondary Navigation */}
        <ul className="flex flex-col gap-4">
          {[
            { href: '/wishlist', label: 'Wishlist', Icon: WishListIcon },
            { href: '/games-library', label: 'Library', Icon: LibraryIcon },
            { href: '/game-recommendations', label: 'Recommendations', Icon: RecommendationsIcon },
          ].map((item) => (
            <Link
              href={item.href}
              key={item.label}
              className={`
                flex items-center py-2 px-3 rounded-lg transition-all duration-200
                text-gray-300 // Default text color
                focus:outline-none focus:bg-gray-700 focus:text-white // Gray glow on focus (keyboard navigation)
                hover:bg-gray-700 hover:text-white // Gray glow ONLY on hover
                ${item.label === 'Recommendations' ? 'gap-4' : 'gap-6'}
              `}
            >
              {/* Maintain the specific size and vertical adjustment for RecommendationsIcon */}
              <item.Icon className={item.label === 'Recommendations' ? 'h-8 w-8 translate-y-0.5' : 'h-6 w-6'} />
              <span className="text-lg font-medium whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default LeftSideBar;