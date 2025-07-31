// frontend/app/components/ui/games/RecommendationsList.tsx
"use client";

import React, { useState, useEffect } from 'react';
import RecommendationsCard from './RecommendationCard';
import { useAuth } from '@/app/context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner'; // Ensure path is correct


// Re-defining interfaces for clarity, typically you'd import these from a shared types file
interface RecommendedGameData {
  id: number;
  rawgId: number;
  name: string;
  background_image?: string | null;
  rating?: number | null;
  released?: string | null;
  recommendationReason: string; // The AI's reason
}


const RecommendationsList: React.FC = () => {
  const { accessToken, loading: authLoading, fetchNewAccessToken } = useAuth();
  const [recommendedGames, setRecommendedGames] = useState<RecommendedGameData[]>([]); // State for recommended games
  const [loading, setLoading] = useState(true); // Local loading state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Don't fetch if auth status is still loading
      if (authLoading) {
        return;
      }

      // If no access token after auth check, user is not logged in.
      // Display error (assuming a parent RequireAuth handles redirection).
      if (!accessToken) {
        setLoading(false);
        setError('Authentication required to view recommendations.');
        return;
      }

      setLoading(true);
      setError(null); // Clear previous errors

      try {
        // Fetch recommendations from your backend endpoint
        const response = await fetch('http://localhost:4000/api/user/recommendations', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`, // Send the access token
          },
          credentials: 'include', // Important for refresh token cookie
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle 401 specifically for expired token retry
          if (response.status === 401 && data.expired) {
            const newAccessToken = await fetchNewAccessToken(); // Attempt to refresh token
            if (newAccessToken) {
              // Retry the recommendations fetch with the new token
              const retryResponse = await fetch('http://localhost:4000/api/user/recommendations', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${newAccessToken}`,
                },
                credentials: 'include',
              });
              const retryData = await retryResponse.json();
              if (retryResponse.ok) {
                setRecommendedGames(retryData.recommendations || []);
              } else {
                setError(retryData.message || 'Failed to re-fetch recommendations after token refresh.');
              }
            } else {
              setError('Session expired. Please log in again.');
              setRecommendedGames([]);
            }
          } else {
            setError(data.message || 'Failed to fetch recommendations.');
          }
          return;
        }

        setRecommendedGames(data.recommendations || []); // Set the fetched recommendations

      } catch (err: any) {
        console.error('Network error fetching recommendations:', err);
        setError('Network error: Could not connect to server.');
      } finally {
        setLoading(false); // Always set loading to false when fetch attempt finishes
      }
    };

    fetchRecommendations();
  }, [accessToken, authLoading, fetchNewAccessToken]); // Dependencies

  // --- Conditional Rendering for Loading/Error/Empty states ---
  if (loading) {
    return (
      <div className="bg-slate-950 text-slate-100 min-h-screen p-10 flex flex-col justify-center items-center">
        <LoadingSpinner className="text-blue-500 w-12 h-12 mb-4" />
        <p>Generating personalized recommendations...</p>
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

  if (recommendedGames.length === 0) {
    return (
      <div className="bg-slate-950 text-gray-400 min-h-screen p-10 flex justify-center items-center">
        <p>No recommendations available at this time. Try adding more games to your library or wishlist!</p>
      </div>
    );
  }

  const desiredCardWidth = '300px'; // Matching your Library/GameCard width
  const desiredCardHeight = '400px'; // Matching your Library/GameCard height

  return (
    <div className="bg-slate-950 min-h-screen p-10">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 justify-center">
        {recommendedGames.map((game) => (
          <RecommendationsCard
            key={game.id} // Use the local game ID as key
            recommendedGame={game}
            imageWidth={desiredCardWidth}
            imageHeight={desiredCardHeight}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendationsList;