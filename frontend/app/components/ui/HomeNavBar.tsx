import React from 'react';
import ProjectLogo from '../icons/ProjectLogo';
import Button from './Button';

const HomeNavBar = () => {
  return (
    <nav
        style={{
        backgroundColor: "#0b1226",
        
        }}
        className="w-full h-20 nav-lines flex items-center"
    >
    <div className='nav-buttons flex items-center justify-center gap-8'>
        <Button variant="default" size="lg">
                Login
    </Button>

    <Button variant="default" size="lg">
                Login
    </Button>
    </div>
  
</nav>

  )
}

export default HomeNavBar;
