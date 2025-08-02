// frontend/app/icons/ProjectLogo.tsx

import React from 'react';
import Link from 'next/link';

// Define the props interface for ProjectLogo
interface ProjectLogoProps {
  className?: string; // Add this line to accept className
  // You can add other props here if needed in the future
}

// Destructure className from props
const ProjectLogo = ({ className }: ProjectLogoProps) => {
  return (
    // Apply the passed className to the outermost div
    <div className={`flex items-center ${className || ''}`}>
      <Link href='/' className='flex items-center'>
        <span
          className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent
                     text-2xl sm:text-3xl lg:text-3xl whitespace-nowrap"
        >
          GameDex
        </span>
      </Link>
    </div>
  );
};

export default ProjectLogo;