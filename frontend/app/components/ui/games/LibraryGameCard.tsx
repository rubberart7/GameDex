"use client";

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
// No useRouter import needed here


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

interface LibraryGameCardProps {
  libraryItem: LibraryItem;
  imageWidth?: string;
  imageHeight?: string;
  onDeleteSuccess: (deletedItemId: number) => void;
  // NEW: Callback to inform parent about delete operation status
  onDeleteStatusChange: (isDeleting: boolean) => void;
}

const LibraryGameCard: React.FC<LibraryGameCardProps> = ({
  libraryItem,
  imageWidth = '215px',
  imageHeight = '300px',
  onDeleteSuccess,
  onDeleteStatusChange // Destructure the new prop
}) => {
  // Re-introduced isDeletingFromLibrary state to control "Deleting..." text
  const [isDeletingFromLibrary, setIsDeletingFromLibrary] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "Error" | "Success" | "Info" | "" }>({
    message: "",
    type: "",
  });
  const { accessToken, loading: authLoading, fetchNewAccessToken, incrementUserCollectionsVersion } = useAuth();

  const { game } = libraryItem;

  const handleDeleteClick = async () => {
    setFeedback({ message: "", type: "" });
    setIsDeletingFromLibrary(true); // Set loading state for "Deleting..." text
    onDeleteStatusChange(true); // Inform parent that a delete is starting

    try {
      if (authLoading) {
        setFeedback({ message: 'Checking login status...', type: 'Info' });
        // Don't reset isDeletingFromLibrary here, let finally handle it
        return;
      }

      if (!accessToken) {
        setFeedback({ message: 'You must be logged in to delete games.', type: 'Error' });
        // Don't reset isDeletingFromLibrary here, let finally handle it
        return;
      }

    const response = await fetch(`http://localhost:4000/api/user/delete-from-library`, {
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
            const retryResponse = await fetch(`http://localhost:4000/api/user/delete-from-library`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newAccessToken}`,
              },
              credentials: 'include',
              body: JSON.stringify({ gameId: game.rawgId }),
            });
            const retryResult = await retryResponse.json();
            if (retryResult.ok) {
              setFeedback({ message: retryResult.message || 'Game deleted successfully!', type: 'Success' });
              if (retryResult.count > 0) {
                incrementUserCollectionsVersion();
                onDeleteSuccess(libraryItem.id);
              }
            } else {
              setFeedback({ message: retryResult.message || 'Failed to delete after token refresh. Please log in again.', type: 'Error' });
            }
          } else {
            setFeedback({ message: 'Session expired. Please log in again.', type: 'Error' });
          }
        } else if (response.status === 409 || (response.status === 200 && result.count === 0)) {
            setFeedback({ message: result.message || 'Game not found in your library. Nothing to delete.', type: 'Info' });
        } else {
          setFeedback({ message: result.message || 'Failed to delete game from library.', type: 'Error' });
        }
        return;
      }

      setFeedback({ message: result.message || 'Game deleted successfully!', type: 'Success' });

      if (result.count > 0) {
        incrementUserCollectionsVersion();
        onDeleteSuccess(libraryItem.id);
      }

    } catch (err: any) {
      console.error('Network error deleting game from library:', err);
      setFeedback({ message: `Network error or server unavailable: ${err.message || 'Please try again.'}`, type: 'Error' });
    } finally {
      setIsDeletingFromLibrary(false); // Reset individual button loading state
      onDeleteStatusChange(false); // Inform parent that delete is finished
    }
  };

  // Button disabled if auth is loading OR if this specific delete operation is in progress
  const isDeleteButtonDisabled = authLoading || isDeletingFromLibrary;
  // Show "Deleting..." text only if the delete operation is in progress
  const deleteButtonText = isDeletingFromLibrary ? 'Deleting...' : 'Delete';

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
          <img
            src={game.background_image}
            alt={game.name}
            className="w-full h-full object-cover rounded-t-md transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400 text-center text-lg rounded-t-md"
          >
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
          aria-label={`Delete ${game.name} from library`}
          disabled={isDeleteButtonDisabled}
        >
          {deleteButtonText}
        </button>
      </div>
    </div>
  );
};

export default LibraryGameCard;