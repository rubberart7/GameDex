
import React from 'react';
import Link from 'next/link';


interface ProjectLogoProps {
  className?: string; 
  
}

const ProjectLogo = ({ className }: ProjectLogoProps) => {
  return (
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