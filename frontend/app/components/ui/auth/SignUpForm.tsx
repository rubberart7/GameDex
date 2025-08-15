"use client"

import React from 'react';
import { useState } from 'react';
import Button from '../common/Button';
import Link from 'next/link';
import SignUpIcon from '../../icons/SignUpIcon';
import EyeToggle from '../common/EyeToggle';


const SignUpForm = () => {
    
    const [fullName, setFullName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

    const [feedback, setFeedback] = useState<{ message: string; type: 'Error' | 'Success' | '' }>({ message: '', type: '' });

    function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
      setFullName(event.target.value);
      setFeedback({ message: '', type: '' }); 
    }

    function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
      setEmail(event.target.value);
      setFeedback({ message: '', type: '' });
    }

    function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
      setPassword(event.target.value);
      setFeedback({ message: '', type: '' });
    }

    async function sendToBackend(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();

      const data = { fullName, email, password };

      try {
        const response = await fetch('http://localhost:4000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          
          setFeedback({ message: result.message || 'Registration failed', type: 'Error' });
          return;
        }

        
        setFeedback({ message: result.message || 'Registration successful!', type: 'Success' });

        
        setFullName('');
        setEmail('');
        setPassword('');
      } catch (error) {
        // Fix: Use the 'error' variable by logging it
        console.error("Network error:", error);
        setFeedback({ message: 'Network error: Could not reach server', type: 'Error' });
      }
    }
    
    return (
      <main className="flex justify-center items-center pt-20 px-4">
          <div className="w-full max-w-md">
            <form 
              action="post" 
              className="border-gray-900 rounded-xl p-8 flex flex-col gap-6 shadow-2xl"
              style={{ 
                backgroundColor: "#0b1226",
              }}
              onSubmit={sendToBackend}
            >
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-gray-100 mb-2">Welcome to GameDex</h1>
                <p className="text-sm text-gray-400">
                  Enter your credentials to sign up for an account.
                </p>
              </div>
      
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <input 
                  type="text" 
                  id="name"
                  value={fullName}
                  className="rounded-lg border border-gray-700 bg-gray-800 text-gray-100 px-4 py-1
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
                             placeholder-gray-500 transition-colors"
                  placeholder="John Doe"
                  onChange={handleNameChange}
                />
              </div>
      
              
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
                </div>

              </div>
                {feedback.message && (
                <div
                  className={`p-3 rounded text-center font-semibold ${
                    feedback.type === 'Error'
                      ? 'bg-red-100 text-red-700 border border-red-400'
                      : 'bg-green-100 text-green-700 border border-green-400'
                  }`}
                >
                  {feedback.message}
                </div>
                )}
                
              <Button 
                variant="default" 
                size="lg" 
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gray-950 h-12"
              >
                <SignUpIcon className="w-5 h-5" />
                Sign Up
              </Button>
      
              
              <div className="border-t border-gray-700 my-2"></div>
      
              
              <p className="text-sm text-center text-gray-400">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-gray-400 underline"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </main>
    )
}

export default SignUpForm