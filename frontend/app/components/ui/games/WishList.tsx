"use client";

import React, { useState, useEffect } from 'react';
import WishListCard from './WishListCard';
import { useAuth } from '@/app/context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface GameData {
  id: number;
  rawgId: number;
  name: string;
  background_image?: string;
  rating?: number;
  released?: string;
}

interface WishListItem {
  id: number;
  userId: number;
  gameId: number;
  status: string;
  addedAt: string;
  game: GameData;
}


const WishList: React.FC = () => {
  const { accessToken, loading: authLoading, fetchNewAccessToken } = useAuth();
  const [wishlistGames, setWishlistGames] = useState<WishListItem[]>([]);
  // Renamed 'loading' to 'isInitialLoading' for clarity on its purpose
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // NEW: State to track if any game is currently being deleted from the list
  const [isDeletingAnyGame, setIsDeletingAnyGame] = useState(false);


  const handleWishlistItemDeleted = (deletedItemId: number) => {
    setWishlistGames(prevGames => prevGames.filter(item => item.id !== deletedItemId));
  };

  // NEW: Callback function passed to child cards to update parent's delete status
  const handleChildDeleteStatusChange = (isDeleting: boolean) => {
    setIsDeletingAnyGame(isDeleting);
  };

  useEffect(() => {
    const fetchUserWishlist = async () => {
      if (authLoading) {
        return;
      }

      if (!accessToken) {
        setIsInitialLoading(false); // Use the new state
        setError('Authentication required to view your wishlist.');
        return;
      }

      // Only set to true if it's an initial load or a refetch not caused by a delete
      // This ensures the spinner doesn't show immediately if a delete is in progress
      // and triggers a refresh.
      // Or, simpler: Always set true, and let the render logic control the spinner visibility.
      // Let's go with the render logic controlling it, which is more robust.
      setIsInitialLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:4000/api/user/wishlist', {
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
              const retryResponse = await fetch('http://localhost:4000/api/user/wishlist', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${newAccessToken}`,
                },
                credentials: 'include',
              });
              const retryData = await retryResponse.json();
              if (retryResponse.ok) {
                setWishlistGames(retryData.wishlist || []);
              } else {
                setError(retryData.message || 'Failed to re-fetch wishlist after token refresh.');
              }
            } else {
              setError('Session expired. Please log in again.');
              setWishlistGames([]);
            }
          } else {
            setError(data.message || 'Failed to fetch wishlist.');
          }
          return;
        }

        setWishlistGames(data.wishlist || []);

      } catch (err: any) {
        console.error('Network error fetching wishlist:', err);
        setError('Network error: Could not connect to server.');
      } finally {
        setIsInitialLoading(false); // Use the new state
      }
    };

    fetchUserWishlist();
  }, [accessToken, authLoading, fetchNewAccessToken]);


  // IMPORTANT: The spinner should only show if the list is loading
  // AND no individual game is currently being deleted.
  // This is the core change to prevent spinner during delete.
  if (isInitialLoading && !isDeletingAnyGame) {
    return (
      <div className="bg-slate-950 text-slate-100 min-h-screen p-10 flex flex-col items-center">
        <LoadingSpinner className="text-blue-500 w-12 h-12 mb-4" />
        <p>Loading your game wishlist...</p>
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

  if (wishlistGames.length === 0) {
    // Only show "empty" message if not currently deleting (to avoid flicker)
    if (!isInitialLoading && !isDeletingAnyGame) {
      return (
        <div className="bg-slate-950 text-gray-400 min-h-screen p-10 flex justify-center">
          <p>Your wishlist is empty. Add some games!</p>
        </div>
      );
    }
    // If it's loading or deleting, don't show empty message yet
    return null; // Or show a minimal placeholder if preferred
  }


  const desiredImageWidth = '300px';
  const desiredImageHeight = '400px';

  return (
    <div className="bg-slate-950 min-h-screen p-10">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-12 justify-center">
        {wishlistGames.map((item) => (
          <WishListCard
            key={item.id}
            wishlistItem={item}
            imageWidth={desiredImageWidth}
            imageHeight={desiredImageHeight}
            onDeleteSuccess={handleWishlistItemDeleted}
            onDeleteStatusChange={handleChildDeleteStatusChange} // Pass the new callback
          />
        ))}
      </div>
    </div>
  );
};

export default WishList;