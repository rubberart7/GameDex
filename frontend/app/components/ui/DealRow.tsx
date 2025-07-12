// components/DealRow.tsx
import React from 'react';
// Import Store from where it's defined (e.g., from interfaces/Store.ts or the same file if you consolidate)
import { Store } from './DealsList'; // Assuming Store is defined in DealsList for now, or import from interfaces/Store.ts

export interface Deal {
    dealID: string;
    storeID: string;
    thumb: string;
    title: string;
    salePrice: string;
    normalPrice: string;
    dealRating: string;
}

export interface GameRowProp {
    deal: Deal;
    storeInfo?: Store; // Make it optional as lookup might return undefined
}

const DealRow: React.FC<GameRowProp> = ({ deal, storeInfo }) => {
    // Base URL for CheapShark images. Adjust if you're hosting them differently.
    const CHEAPSHARK_IMG_BASE_URL = "https://www.cheapshark.com";

    return (
        <tr className="border-b border-gray-700 hover:bg-gray-800 transition-colors duration-200">
            {/* Store Icon/Name */}
            <td className="px-4 py-3 whitespace-nowrap text-center">
                {storeInfo ? ( // Check if storeInfo exists
                    <div className="flex items-center justify-center flex-col">
                        <img
                            src={`${CHEAPSHARK_IMG_BASE_URL}${storeInfo.images.logo}`} // Use the icon from storeInfo
                            alt={storeInfo.storeName}
                            className="w-8 h-8 object-contain rounded-full"
                        />
                        <span className="text-gray-400 text-xs mt-1">
                            {storeInfo.storeName} {/* Use the store name from storeInfo */}
                        </span>
                    </div>
                ) : (
                    // Fallback if storeInfo is not found
                    <span className="text-gray-500 text-sm">Store ID: {deal.storeID}</span>
                )}
            </td>

            {/* Price (Sale Price & Normal Price) */}
            <td className="px-4 py-3 whitespace-nowrap text-center">
                <div className="flex flex-col items-center">
                    <span className="text-sm line-through text-gray-500">${deal.normalPrice}</span>
                    <span className="text-lg font-bold text-blue-400">${deal.salePrice}</span>
                </div>
            </td>

            {/* Thumbnail and Title */}
            <td className="px-4 py-3 flex items-center space-x-3">
                <img src={deal.thumb} alt={deal.title} className="w-16 h-8 object-cover rounded" />
                <h2 className="text-gray-100 font-medium text-base">{deal.title}</h2>
            </td>

            {/* Deal Rating */}
            <td className="px-4 py-3 whitespace-nowrap text-center text-yellow-400 font-bold">
                {deal.dealRating || 'N/A'}
            </td>
        </tr>
    );
}

export default DealRow;