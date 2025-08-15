"use client";

import React, { useState, useEffect } from 'react';
import RecommendationsCard from './RecommendationsCard';
import { useAuth } from '@/app/context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface RecommendedGameData {
  id: number;
  rawgId: number;
  name: string;
  background_image?: string | null;
  rating?: number | null;
  released?: string | null;
  recommendationReason: string;
}

const RecommendationsList: React.FC = () => {
  const { accessToken, loading: authLoading, fetchNewAccessToken, userCollectionsVersion } = useAuth();
  const [recommendedGames, setRecommendedGames] = useState<RecommendedGameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (authLoading) return;
      if (!accessToken) {
        setLoading(false);
        setError('Authentication required to view recommendations.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:4000/api/user/game-recommendations', {
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
              const retryResponse = await fetch('http://localhost:4000/api/user/game-recommendations', {
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

        setRecommendedGames(data.recommendations || []);
      } catch (err: unknown) {
        console.error('Network error fetching recommendations:', err);
        setError('Network error: Could not connect to server.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [accessToken, authLoading, fetchNewAccessToken, userCollectionsVersion]); 

  if (loading) {
    return (
      <div className="bg-slate-950 text-slate-100 min-h-screen p-10 flex flex-col items-center">
        <LoadingSpinner className="text-blue-500 w-12 h-12 mb-4" />
        <p>Generating personalized recommendations...</p>
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

  if (recommendedGames.length === 0) {
    return (
      <div className="bg-slate-950 text-gray-400 min-h-screen p-10 flex justify-center">
        <p>No recommendations available at this time. Try adding more games to your library or wishlist!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen p-10">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(215px,1fr))] gap-6">
        {recommendedGames.map((game) => (
          <RecommendationsCard key={game.id} recommendedGame={game} />
        ))}
      </div>
    </div>
  );
};

export default RecommendationsList;