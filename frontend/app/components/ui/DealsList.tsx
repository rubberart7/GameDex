// components/DealsList.tsx
import React from 'react';
import DealRow, { Deal } from './DealRow';
// Assuming Store and StoreImage interfaces are defined in interfaces/Store.ts
// If not, you can keep them directly in this file or create interfaces/Store.ts
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


const DealsList = async () => {

    const [dealsRes, storesRes] = await Promise.all([
        fetch('http://localhost:4000/api/deals'), // Your backend API for deals
        fetch('http://localhost:4000/api/stores') // Your backend API for stores
    ]);

    // Handle potential errors for deals fetch
    if (!dealsRes.ok) {
        throw new Error('Failed to fetch deals!');
    }
    const deals: Deal[] = await dealsRes.json();

    // Handle potential errors for stores fetch
    if (!storesRes.ok) {
        console.error('Failed to fetch store data from API.');
        throw new Error('Failed to fetch store data!');
    }
    const stores: Store[] = await storesRes.json();

    // Create a Map for quick lookup of store details by storeID
    const storeMap = new Map<string, Store>();
    stores.forEach(store => {
        storeMap.set(store.storeID, store);
    });

    return (
        // This is the main section wrapper for the entire deals list content
        <section className="flex-grow flex flex-col items-center py-8 px-4 bg-gray-950 text-gray-100">
            {/* Page Title and Description */}
            <div className="max-w-3xl text-center space-y-6 mb-8"> {/* Added mb-8 for spacing below text */}
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

            {/* Existing Table Container */}
            <div className="w-full max-w-7xl mx-auto p-4 overflow-x-auto">
                <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                            <tr>
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
                            {deals.map((deal) => {
                                // Correctly look up the single store object for the current deal
                                const associatedStore = storeMap.get(deal.storeID);
                                return (
                                    <DealRow key={deal.dealID} deal={deal} storeInfo={associatedStore} />
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

export default DealsList;