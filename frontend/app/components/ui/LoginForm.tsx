"use client";

import React from 'react'
import { useState } from 'react';
import Button from './Button';
import Link from 'next/link';
import LoginIcon from '../icons/LoginIcon';
import EyeToggle from './EyeToggle';

const LoginForm = () => {
  
  const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);


    function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
      setEmail(event.target.value);
    }

    function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
      setPassword(event.target.value);
    }

    async function sendToBackend(event: React.FormEvent<HTMLFormElement>) {
            event.preventDefault();
    
        const data = {  email, password }
        try {
            const response = await fetch('http://localhost:4000/api/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data)
          });
    
          if (!response.ok) {
          // Handle errors here - maybe show an error message
            const errorData = await response.json();
            console.error('Server error:', errorData);
            alert('Error: ' + (errorData.message || 'Failed to login'));
            return;
          }
    
          const result = await response.json();
          console.log('Success:', result);
          alert('Login successful!');
    
          // Optionally, clear the form or redirect
          setEmail('');
          setPassword('');
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Network error: Could not reach server');
        }
        }
    

    return (
        <main className="flex justify-center items-center pt-20 px-4">
            <div className="w-full max-w-md">
              <form
                className="border-gray-900 rounded-xl p-8 flex flex-col gap-6 shadow-2xl"
                style={{ 
                  backgroundColor: "#0b1226",
                }}
                onSubmit={sendToBackend}
              >
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold text-gray-100 mb-2">Login to GameDex</h1>
                  <p className="text-sm text-gray-400">
                    Enter your credentials to sign in to your account.
                  </p>
                </div>
    
                {/* Email Field */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input 
                    type="email" 
                    id="email"
					value={email}
                    className="rounded-lg border border-gray-700 bg-gray-800 text-gray-100 px-4 py-1
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
                             placeholder-gray-500 transition-colors"
                    placeholder="name@example.com"
                    onChange={handleEmailChange}
                  />
                </div>
    
                {/* Password Field */}
                <div className="flex flex-col gap-2 relative">
                  <label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <input 
                    type={isPasswordVisible ? "text" : "password"} 
                    id="password"
					value={password}
                    className="rounded-lg border border-gray-700 bg-gray-800 text-gray-100 px-4 py-1
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
                             placeholder-gray-500 transition-colors"
                    placeholder="••••••••"
                    onChange={handlePasswordChange}
                  />
                  <div className="absolute right-4 top-8.75">
                        <EyeToggle
                        isVisible={isPasswordVisible}
                        toggle={() => setIsPasswordVisible(!isPasswordVisible)}
                        />
                        {/*  isVisible is a prop that tells the EyeToggle component whether the password is currently visible or hidden. */}
                    </div>
                </div>
    
                {/* Login Button */}
                <Button 
                  variant="default" 
                  size="lg" 
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-gray-950 h-12"
                  
                >
                  <LoginIcon className="w-5 h-5" />
                  Login
                </Button>
    
                {/* Thin Divider */}
                <div className="border-t border-gray-700 my-2"></div>
    
                {/* Sign Up Link */}
                <p className="text-sm text-center text-gray-400">
                  Don't have an account?{' '}
                  <Link 
                    href="/signup" 
                    className="text-gray-400 underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </form>
            </div>
          </main>
  )
}

export default LoginForm