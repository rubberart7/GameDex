import React from 'react';
import Link from 'next/link';

const ProjectLogo = () => {
  return (
    <div className='flex items-center'>

      <Link href='/' className='flex items-center'>
        <span className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                GameDex  
        </span>
      </Link>
        
    </div>
  )
}

export default ProjectLogo;
