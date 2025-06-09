import React from 'react';
import ProjectLogo from '../icons/ProjectLogo';
import Button from './Button';
import LoginIcon from '../icons/LoginIcon';
import SignUpIcon from '../icons/SignUpIcon';
import Link from 'next/link';

const HomeNavBar = () => {
  return (
    <nav
        style={{
        backgroundColor: "#0b1226",
        
        }}
        className="w-full h-20 nav-lines flex items-center justify-center gap-200"
    >
        <ProjectLogo></ProjectLogo>
        <div className='nav-buttons flex items-center justify-center gap-8'>
            <Link href='/login'>
              <Button variant="default" size="md">
                  <LoginIcon className="w-4 h-4" />
                      Login
              </Button>
            </Link>
            
            <Link href='/signup'>
              <Button variant="signup" size="md">
                  <SignUpIcon className="w-4 h-4" />
                      Signup
              </Button>
            </Link>
            

            
        </div>
        
    </nav>

  )
}

export default HomeNavBar;
