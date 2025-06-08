import React from 'react';

const UpcomingGamesIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <div>
      <svg
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="white"
        strokeWidth="3"
        {...props}
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          <rect x="9.59" y="9.59" width="44.82" height="44.82" rx="2.5"></rect>
          <line x1="9.59" y1="20.59" x2="54.41" y2="20.59"></line>
          <line x1="19.7" y1="9.59" x2="19.7" y2="4.59"></line>
          <line x1="43.66" y1="9.59" x2="43.66" y2="4.59"></line>
          <rect x="16.14" y="27.92" width="6.15" height="6.15"></rect>
          <rect x="28.78" y="27.92" width="6.15" height="6.15"></rect>
          <rect x="41.26" y="27.92" width="6.15" height="6.15"></rect>
          <rect x="16.36" y="39.68" width="6.15" height="6.15"></rect>
          <rect x="29.01" y="39.68" width="6.15" height="6.15"></rect>
          <rect x="41.49" y="39.68" width="6.15" height="6.15"></rect>
        </g>
      </svg>
    </div>
  );
};

export default UpcomingGamesIcon;
