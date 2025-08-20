"use client";

import React, { useState, useEffect, useMemo } from 'react';
import LibraryGameCard from './LibraryGameCard';
import { useAuth } from '@/app/context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface GameData {
  id: number;
  rawgId: number;
  name: string;
  background_image?: string;
  rating?: number;
  released?: string;
  genres?: { id: number; name: string; slug: string; }[]; 
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingAnyGame, setIsDeletingAnyGame] = useState(false);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('addedAt-desc'); 

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  const categories = [
    { name: 'Action', slug: 'action' },
    { name: 'Adventure', slug: 'adventure' },
    { name: 'RPG', slug: 'role-playing-games-rpg' },
    { name: 'Strategy', slug: 'strategy' },
    { name: 'Shooter', slug: 'shooter' },
    { name: 'Puzzle', slug: 'puzzle' },
    { name: 'Racing', slug: 'racing' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Simulation', slug: 'simulation' },
    { name: 'Indie', slug: 'indie' },
    { name: 'Platformer', slug: 'platformer' },
    { name: 'Fighting', slug: 'fighting' },
    { name: 'Family', slug: 'family' },
    { name: 'Arcade', slug: 'arcade' },
    { name: 'Casual', slug: 'casual' },
  ];

  const sortOptions = [
    { name: 'Added Date (Newest)', value: 'addedAt-desc' },
    { name: 'Added Date (Oldest)', value: 'addedAt-asc' },
    { name: 'Name (A-Z)', value: 'name-asc' },
    { name: 'Name (Z-A)', value: 'name-desc' },
    { name: 'Release Date (Newest)', value: 'released-desc' },
    { name: 'Release Date (Oldest)', value: 'released-asc' },
    { name: 'Metacritic Score (Highest)', value: 'metacritic-desc' },
  ];

  const handleGameDeleted = (deletedItemId: number) => {
    setLibraryGames(prevGames => prevGames.filter(item => item.id !== deletedItemId));
  };

  const handleChildDeleteStatusChange = (isDeleting: boolean) => {
    setIsDeletingAnyGame(isDeleting);
  };

  useEffect(() => {
    const fetchUserLibrary = async () => {
      if (authLoading) {
        return;
      }

      if (!accessToken) {
        setIsInitialLoading(false);
        setError('Authentication required to view your library.');
        return;
      }

      setIsInitialLoading(true);
      setError(null);

      try {
        const response = await fetch(`${serverUrl}api/user/library`, {
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
              const retryResponse = await fetch(`${serverUrl}api/user/library`, {
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
        setIsInitialLoading(false);
      }
    };

    fetchUserLibrary();
  }, [accessToken, authLoading, fetchNewAccessToken]);

  const filteredAndSortedGames = useMemo(() => {
    let currentGames = [...libraryGames];

    if (searchTerm) {
      currentGames = currentGames.filter(item =>
        item.game.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      currentGames = currentGames.filter(item =>
        item.game.genres && item.game.genres.some(genre => genre.slug === selectedCategory)
      );
    }

    
    currentGames.sort((a, b) => {
      switch (selectedSort) {
        case 'addedAt-desc':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case 'addedAt-asc':
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        case 'name-asc':
          return a.game.name.localeCompare(b.game.name);
        case 'name-desc':
          return b.game.name.localeCompare(a.game.name);
        case 'released-desc':
          const releasedA_desc = a.game.released ? new Date(a.game.released).getTime() : 0;
          const releasedB_desc = b.game.released ? new Date(b.game.released).getTime() : 0;
          return releasedB_desc - releasedA_desc;
        case 'released-asc':
          const releasedA_asc = a.game.released ? new Date(a.game.released).getTime() : 0;
          const releasedB_asc = b.game.released ? new Date(b.game.released).getTime() : 0;
          return releasedA_asc - releasedB_asc;
        case 'metacritic-desc':
          
          return (b.game.rating || 0) - (a.game.rating || 0);
        default:
          return 0;
      }
    });

    return currentGames;
  }, [libraryGames, searchTerm, selectedCategory, selectedSort]);


  if (isInitialLoading && !isDeletingAnyGame) {
    return (
      <div className="bg-slate-950 text-slate-100 min-h-screen p-10 flex flex-col items-center">
        <LoadingSpinner className="text-blue-500 w-12 h-12 mb-4" />
        <p>Loading your game library...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-950 text-red-400 min-h-screen p-10 flex justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  const desiredImageWidth = '300px';
  const desiredImageHeight = '400px';

  return (
    <div className="bg-slate-950 min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative flex-grow min-w-0 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search your library"
            className="w-full pl-10 pr-4 py-2 rounded-md bg-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <select
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.slug} value={category.slug}>{category.name}</option>
            ))}
          </select>

          <select
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-slate-800 text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.name}</option>
            ))}
          </select>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-blue-400">My Library</h2>

      {filteredAndSortedGames.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-12 justify-center"> {/* REVERTED grid-cols back to original minmax(300px,1fr) */}
          {filteredAndSortedGames.map((item) => (
            <LibraryGameCard
              key={item.id}
              libraryItem={item}
              imageWidth={desiredImageWidth}
              imageHeight={desiredImageHeight}
              onDeleteSuccess={handleGameDeleted}
              onDeleteStatusChange={handleChildDeleteStatusChange}
            />
          ))}
        </div>
      ) : (
        !isInitialLoading && !isDeletingAnyGame && (
          <div className="flex items-center justify-center h-full text-gray-400 py-10">
            <p className="text-lg">No games found in your library matching your criteria.</p>
          </div>
        )
      )}

      {isInitialLoading && filteredAndSortedGames.length === 0 && (
        <div className="bg-slate-950 text-slate-100 min-h-screen p-10 flex flex-col items-center">
          <LoadingSpinner className="text-blue-500 w-12 h-12 mb-4" />
          <p>Loading your game library...</p>
        </div>
      )}
    </div>
  );
};

export default LibraryList;