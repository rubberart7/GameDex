import React from 'react';

const LibraryIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <div> 
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="white"
            className="size-6"
            {...props}
            >
            <rect x="1" y="1" width="9" height="9" />
            <rect x="14" y="1" width="9" height="9" />
            <rect x="1" y="14" width="9" height="9" />
            <rect x="14" y="14" width="9" height="9" />
        </svg>
    </div>
    
  );
};

export default LibraryIcon;
