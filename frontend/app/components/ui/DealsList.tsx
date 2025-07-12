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
        <div className="w-full max-w-7xl mx-auto p-4 overflow-x-auto">
            <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Store
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Deal Rating
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
    );
}

export default DealsList;