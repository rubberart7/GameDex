// This component can be placed in a separate file, e.g., components/LoadingSpinner.tsx
// and then imported into RequireAuth.tsx and DealsList.tsx

import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-8 px-4 bg-gray-950 text-gray-100 min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative flex h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-4 border-blue-500 border-opacity-75 animate-spin"></div>
          <div className="absolute inset-0 rounded-full border-4 border-b-4 border-cyan-400 border-opacity-75 animate-spin-reverse" style={{animationDelay: '-0.5s'}}></div> {/* Spin in reverse, slightly delayed */}
          <div className="absolute inset-0 rounded-full border-4 border-r-4 border-blue-300 border-opacity-75 animate-spin" style={{animationDelay: '-1s'}}></div>
          <div className="absolute inset-0 rounded-full border-4 border-l-4 border-cyan-200 border-opacity-75 animate-spin-reverse" style={{animationDelay: '-1.5s'}}></div>
        </div>
        {/* Loading Text */}
        <p className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text animate-pulse">
          Loading GameDex...
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;