// frontend/app/components/ui/games/LibraryList.tsx
"use client";

import React, { useState, useEffect } from 'react';
import LibraryGameCard from './LibraryGameCard';
import { useAuth } from '@/app/context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner'; // Corrected path based on your provided code

interface GameData {
  id: number;
  rawgId: number;
  name: string;
  background_image?: string;
  rating?: number;
  released?: string;
}

interface LibraryItem {
  id: number;
  userId: number;
  gameId: number;
  status: string;
  addedAt: string;
  game: GameData;
}

const LibraryList: React.FC = () => {
  const { accessToken, loading: authLoading, fetchNewAccessToken } = useAuth();
  const [libraryGames, setLibraryGames] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserLibrary = async () => {
      if (authLoading) {
        return;
      }

      if (!accessToken) {
        setLoading(false);
        setError('Authentication required to view your library.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:4000/api/user/library', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401 && data.expired) {
            const newAccessToken = await fetchNewAccessToken();
            if (newAccessToken) {
              const retryResponse = await fetch('http://localhost:4000/api/user/library', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${newAccessToken}`,
                },
                credentials: 'include',
              });
              const retryData = await retryResponse.json();
              if (retryResponse.ok) {
                setLibraryGames(retryData.library || []);
              } else {
                setError(retryData.message || 'Failed to re-fetch library after token refresh.');
              }
            } else {
              setError('Session expired. Please log in again.');
              setLibraryGames([]);
            }
          } else {
            setError(data.message || 'Failed to fetch library.');
          }
          return;
        }

        setLibraryGames(data.library || []);
      } catch (err) {
        console.error('Network error fetching library:', err);
        setError('Network error: Could not connect to server.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserLibrary();
  }, [accessToken, authLoading, fetchNewAccessToken]);

  if (loading) {
    return (
      <div className="bg-slate-950 text-slate-100 min-h-screen p-10 flex flex-col justify-center items-center">
        <LoadingSpinner className="text-blue-500 w-12 h-12 mb-4" />
        <p>Loading your game library...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-950 text-red-400 min-h-screen p-10 flex justify-center items-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (libraryGames.length === 0) {
    return (
      <div className="bg-slate-950 text-gray-400 min-h-screen p-10 flex justify-center items-center">
        <p>Your library is empty. Add some games!</p>
      </div>
    );
  }

  // Define your desired literal pixel width and height here
  // Adjust these values to fine-tune the size of your cards
  const desiredImageWidth = '215px'; // Matches typical Epic Games card width
  const desiredImageHeight = '300px'; // Matches typical Epic Games card height

  return (
    <div className="bg-slate-950 min-h-screen p-10">
      {/* Grid to handle wrapping based on desired card width */}
      {/* The minmax value should generally match your desiredImageWidth */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(215px,1fr))] gap-6 justify-center">
        {libraryGames.map((item) => (
          <LibraryGameCard
            key={item.id}
            libraryItem={item}
            imageWidth={desiredImageWidth}    // Pass the pixel width prop
            imageHeight={desiredImageHeight}  // Pass the pixel height prop
          />
        ))}
      </div>
    </div>
  );
};

export default LibraryList;