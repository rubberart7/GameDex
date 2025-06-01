import React from 'react';

const LeftSideBar = () => {
  return (
    <div className="w-60 h-screen bg-gray-900 text-gray-300 flex flex-col px-4 py-6 select-none">
      {/* Section 1: Home Store */}
      <nav className="mb-12">
        <ul className="space-y-3">
          {[
            'Home',
            'Store',
            'Browse Games',
            'Genres',
            'New Releases',
            'Top Sellers',
            'Upcoming Games',
            'Free Games',
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-700 transition"
            >
              {/* Icon placeholder */}
              <div className="w-5 h-5 bg-gray-600 rounded-sm flex items-center justify-center text-xs text-gray-400">
                I
              </div>
              <span className="text-sm font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* Section 2: User Area */}
      <nav>
        <ul className="space-y-3">
          {['Profile', 'Wishlist', 'Library', 'Settings'].map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-700 transition"
            >
              {/* Icon placeholder */}
              <div className="w-5 h-5 bg-gray-600 rounded-sm flex items-center justify-center text-xs text-gray-400">
                I
              </div>
              <span className="text-sm font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default LeftSideBar;
