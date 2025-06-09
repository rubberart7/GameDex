import React from 'react';
import Link from 'next/link';

const ProjectLogo = () => {
  return (
    <div>
      <Link href='/'>
        <img src="/assets/game_logo.png" alt="game logo" 
          style={{ display: 'block',  // removes default inline spacing under images
          width: '200px',   
          height: '200px',
          margin: 0,
          padding: 0,
          border: 'none',}}
        />
      </Link>
        
    </div>
  )
}

export default ProjectLogo;
