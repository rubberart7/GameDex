'use client';

import React from 'react';
import ProjectLogo from '../../icons/ProjectLogo';
import Button from '../common/Button';
import LoginIcon from '../../icons/LoginIcon';
import SignUpIcon from '../../icons/SignUpIcon';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import LogoutButton from '../auth/LogoutButton';

const HomeNavBar = () => {
  const { accessToken, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <nav
      className="w-full bg-background/95 backdrop-blur-sm nav-lines shadow-xl sticky top-0 z-50"
      style={{
        backgroundColor: "#0b1226",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center flex-shrink-0 min-w-0">
            <ProjectLogo />
          </div>

          <div className="flex items-center space-x-4 sm:space-x-6 md:space-x-8">
            {accessToken ? (
              <LogoutButton />
            ) : (
              <Link href='/login' passHref>
                <Button 
                  // Updated classes to match the size of the logout button
                  className="inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none cursor-pointer bg-blue-600 text-white hover:bg-blue-700 flex gap-2 focus:ring-blue-500 rounded-lg px-4 py-2 text-base"
                  onClick={() => {}}
                >
                  <LoginIcon className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}

            <Link href='/signup' passHref>
              <Button
                // Updated classes to match the size of the logout button
                className="inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:pointer-events-none cursor-pointer bg-slate-800 text-white hover:bg-slate-950 focus:ring-slate-700 flex gap-2 rounded-lg px-4 py-2 text-base"
                onClick={() => {}}
              >
                <SignUpIcon className="w-4 h-4" />
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