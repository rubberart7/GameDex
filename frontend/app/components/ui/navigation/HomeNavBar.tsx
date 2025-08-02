'use client'; // This directive makes the component a Client Component

import React from 'react';
import ProjectLogo from '../../icons/ProjectLogo';
import Button from '../common/Button';
import LoginIcon from '../../icons/LoginIcon';
import SignUpIcon from '../../icons/SignUpIcon';
import Link from 'next/link';

const HomeNavBar = () => {
  return (
    <nav
      // Styling: full width, background, blur, border, sticky, enhanced shadow
      // Changed border-border to border-blue-500 for a blue underline
      className="w-full bg-background/95 backdrop-blur-sm nav-lines shadow-xl sticky top-0 z-50"
      style={{
        backgroundColor: "#0b1226",
      }}
    >
      {/* Inner div for max-width and horizontal padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Innermost div for flex layout of logo and buttons */}
        {/* Increased height to h-20 for a taller navbar */}
        <div className="flex justify-between items-center h-20">
          {/* Left side: Project Logo */}
          <div className="flex items-center flex-shrink-0 min-w-0">
            <ProjectLogo />
          </div>

          {/* Right side: Navigation Buttons */}
          <div className="flex items-center space-x-4 sm:space-x-6 md:space-x-8">
            {/* Login Button */}
            <Link href='/login' passHref>
              <Button variant="default" size="sm">
                <LoginIcon className="w-4 h-4 mr-1" />
                Login
              </Button>
            </Link>

            {/* Signup Button */}
            <Link href='/signup' passHref>
              <Button variant="signup" size="sm">
                <SignUpIcon className="w-4 h-4 mr-1" />
                Signup
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavBar;