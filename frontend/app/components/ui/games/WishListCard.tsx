"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';

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

interface WishListCardProps {
  wishlistItem: WishListItem;
  imageWidth?: string;
  imageHeight?: string;
  onDeleteSuccess: (deletedItemId: number) => void;
  onDeleteStatusChange: (isDeleting: boolean) => void;
}

const WishListCard: React.FC<WishListCardProps> = ({
  wishlistItem,
  imageWidth = '215px',
  imageHeight = '300px',
  onDeleteSuccess,
  onDeleteStatusChange 
}) => {
  const [isDeletingFromWishList, setIsDeletingFromWishList] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "Error" | "Success" | "Info" | "" }>({
    message: "",
    type: "",
  });

  const { accessToken, loading: authLoading, fetchNewAccessToken, incrementUserCollectionsVersion } = useAuth();

  const { game } = wishlistItem;

  const handleDeleteClick = async () => {
    setFeedback({ message: "", type: "" });
    setIsDeletingFromWishList(true); 
    onDeleteStatusChange(true); 

    try {
      if (authLoading) {
        setFeedback({ message: 'Checking login status...', type: 'Info' });
        return;
      }

      if (!accessToken) {
        setFeedback({ message: 'You must be logged in to delete games.', type: 'Error' });
        return;
      }

      const response = await fetch(`http://localhost:4000/api/user/delete-from-wishlist`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ gameId: game.rawgId }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 && result.expired) {
          const newAccessToken = await fetchNewAccessToken();
          if (newAccessToken) {
            const retryResponse = await fetch(`http://localhost:4000/api/user/delete-from-wishlist`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newAccessToken}`,
              },
              credentials: 'include',
              body: JSON.stringify({ gameId: game.rawgId }),
            });
            const retryResult = await retryResponse.json();
            if (retryResponse.ok) {
              setFeedback({ message: retryResult.message || 'Game deleted successfully!', type: 'Success' });
              if (retryResult.count > 0) {
                incrementUserCollectionsVersion();
                onDeleteSuccess(wishlistItem.id);
              }
            } else {
              setFeedback({ message: retryResult.message || 'Failed to delete after token refresh. Please log in again.', type: 'Error' });
            }
          } else {
            setFeedback({ message: 'Session expired. Please log in again.', type: 'Error' });
          }
        } else if (response.status === 409 || (response.status === 200 && result.count === 0)) {
          setFeedback({ message: result.message || 'Game not found in your WishList. Nothing to delete.', type: 'Info' });
        } else {
          setFeedback({ message: result.message || 'Failed to delete game from WishList.', type: 'Error' });
        }
        return;
      }

      setFeedback({ message: result.message || 'Game deleted successfully!', type: 'Success' });
      if (result.count > 0) {
        incrementUserCollectionsVersion();
        onDeleteSuccess(wishlistItem.id);
      }

    } catch (err: unknown) {
      console.error('Network error deleting game from WishList:', err);
      setFeedback({ message: 'Network error or server unavailable: Please try again.', type: 'Error' });
    } finally {
      setIsDeletingFromWishList(false); 
      onDeleteStatusChange(false); 
    }
  };

  const isDeleteButtonDisabled = authLoading || isDeletingFromWishList;
  const deleteButtonText = isDeletingFromWishList ? 'Deleting...' : 'Delete';

  return (
    <div className="
      bg-slate-950
      rounded-sm
      overflow-hidden
      shadow-md
      transform transition-transform duration-300 hover:scale-108
      cursor-pointer
      flex flex-col
      relative
    ">
      <div className="relative overflow-hidden relative-shine"
            style={{ width: imageWidth, height: imageHeight }}>
        {game.background_image ? (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            className="object-cover rounded-t-md transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400 text-center text-lg rounded-t-md">
            No Image Available
          </div>
        )}
      </div>

      <div className="p-3 flex-grow flex flex-col justify-between bg-slate-950">
        <h3 className="text-gray-300 text-lg font-semibold truncate">
          {game.name}
        </h3>
        <div className="flex items-center text-sm text-gray-400 mt-1">
          {game.rating != null && (
            <span className="text-gray-400 mr-1">
              {game.rating.toFixed(1)}
            </span>
          )}
          {game.released && (
            <span className="text-gray-500">
              ({game.released.substring(0, 4)})
            </span>
          )}
        </div>
      </div>

      {feedback.message && (
        <div className={`absolute inset-x-0 bottom-0 p-2 text-xs rounded-b-lg text-center font-semibold
          ${feedback.type === "Error" ? "bg-red-800 text-red-100 border border-red-500"
            : feedback.type === "Success" ? "bg-green-800 text-green-100 border border-green-500"
              : "bg-blue-800 text-blue-100 border border-blue-500"
          }`}>
          {feedback.message}
          <button
            onClick={() => setFeedback({ message: "", type: "" })}
            className="absolute top-1 right-2 text-white opacity-70 hover:opacity-100 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      <div className="
        w-full
        bg-slate-950
        hover:bg-slate-900
        cursor-pointer
        transition-colors duration-200
        py-2.5 px-3
        flex justify-center items-center
        group
        mt-auto
      ">
        <button
          onClick={handleDeleteClick}
          className="
            flex items-center
            text-gray-300 group-hover:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50
            w-full h-full text-base font-semibold
            cursor-pointer
          "
          aria-label={`Delete ${game.name} from WishList`}
          disabled={isDeleteButtonDisabled}
        >
          {deleteButtonText}
        </button>
      </div>
    </div>
  );
};

export default WishListCard;
