// components/LoadingSpinner.tsx
// This component can now be imported into Button.tsx, RequireAuth.tsx, DealsList.tsx, etc.
// for a compact, inline loading indicator.

import React from 'react';

// You might consider adding a className prop to this simple spinner
// so you can adjust its size or margin when it's used in different places.
interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className }) => {
  return (
    <svg
      // The default classes make it a small, animating circle.
      // 'text-current' ensures it inherits the color of its parent text.
      className={`animate-spin h-5 w-5 text-current ${className || ''}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

export default LoadingSpinner;