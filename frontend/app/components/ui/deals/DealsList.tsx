'use client'; // This directive is essential for making it a Client Component

import React, { useEffect, useState } from 'react';
import DealRow, { Deal } from './DealRow';
// Assuming Store and StoreImage interfaces are defined here or in interfaces/Store.ts
// It's generally good practice to put interfaces in a separate file like `types/index.ts` or `interfaces/index.ts`
// but for this full code example, I'll keep them here for completeness.

import LoadingSpinner from '../common/LoadingSpinner';
export interface StoreImage {
  banner: string;
  logo: string;
  icon: string; // This is the path to the icon
}

export interface Store {
  storeID: string;
  storeName: string; // This is the store name
  isActive: number;
  images: StoreImage;
}

const DealsList = () => {
  // State for raw fetched data
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  // State for loading and error handling
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for the search input
  const [searchTerm, setSearchTerm] = useState<string>('');

  // --- useEffect for Data Fetching ---
  // This effect runs only once after the initial render to fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true before starting fetches
        setError(null);   // Clear any previous errors

        const [dealsRes, storesRes] = await Promise.all([
          fetch('http://localhost:4000/api/deals'), // Your backend API for deals
          fetch('http://localhost:4000/api/stores') // Your backend API for stores
        ]);

        if (!dealsRes.ok) {
          throw new Error(`Failed to fetch deals! Status: ${dealsRes.status}`);
        }
        const dealsData: Deal[] = await dealsRes.json();
        setAllDeals(dealsData); // Store all fetched deals

        if (!storesRes.ok) {
          throw new Error(`Failed to fetch store data! Status: ${storesRes.status}`);
        }
        const storesData: Store[] = await storesRes.json();
        setStores(storesData);

      } catch (err) {
        console.error("Error fetching data:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred during data fetching.');
        }
      } finally {
        setLoading(false); // Set loading to false once fetches are complete (success or failure)
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs ONLY ONCE on mount

  // --- Filtering Logic ---
  // This will be the array that's actually rendered
  const filteredDeals = allDeals.filter((deal) => {
    // If the search term is empty, show all deals
    if (searchTerm === '') {
      return true;
    }
    // Otherwise, filter by title (case-insensitive)
    return deal.title.toLowerCase().includes(searchTerm.toLowerCase());
  });


  // Create a Map for quick lookup of store details by storeID
  // This map depends on `stores` state, so it will re-create if `stores` changes
  const storeMap = new Map<string, Store>();
  stores.forEach(store => {
    storeMap.set(store.storeID, store);
  });

  // --- Conditional Rendering for Loading/Error states ---
  if (loading) {
    return (
      <LoadingSpinner></LoadingSpinner>
    );
  }

  if (error) {
    return (
      <section className=" flex flex-col items-center justify-center py-8 px-4 bg-gray-950 text-gray-100 min-h-screen">
        <p className="text-xl text-red-500">Error: {error}</p>
        <p className="text-md text-gray-400 mt-2">Please check your network connection or the API endpoint.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-shrink flex-col items-center py-8 px-4 bg-gray-950 text-gray-100">
      {/* Page Title and Description */}
      <div className="max-w-3xl text-center space-y-6 mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Discover the{" "}
          <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text">
            Best Game Deals
          </span>{" "}
          Today
        </h1>
        <p className="text-slate-400 text-lg">
          Browse our constantly updated catalog of video game deals from across the web. We scour top retailers like Steam, Epic Games, and Humble Bundle to bring you the lowest prices, so you can expand your library without breaking the bank. Find your next game for less!
        </p>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Search for games..."
          className="w-full py-3 px-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400"
          value={searchTerm} // Bind input value to searchTerm state
          onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm on change
        />
      </div>

      {/* Existing Table Container */}
      <div className="w-full max-w-7xl mx-auto p-4 overflow-x-auto">
        <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr className='divide-x'>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Deal Rating
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Release Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800 text-gray-200">
              {filteredDeals.length > 0 ? ( // Check if there are deals to display
                filteredDeals.map((deal) => {
                  const associatedStore = storeMap.get(deal.storeID);
                  return (
                    <DealRow key={deal.dealID} deal={deal} storeInfo={associatedStore} />
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                    {searchTerm ? "No deals match your search." : "No deals found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default DealsList;