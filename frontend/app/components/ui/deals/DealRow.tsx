import React from 'react';
import Image from 'next/image';
import { Store } from './DealsList'; 
import GameNameClickable from '../games/GameNameClickable';
export interface Deal {
    dealID: string;
    storeID: string;
    thumb: string;
    title: string;
    salePrice: string;
    normalPrice: string;
    dealRating: string;
    releaseDate: number;
    metacriticLink?: string;
}

export interface GameRowProp {
    deal: Deal;
    storeInfo?: Store; 
}

export const formatReleaseDate = (unixTimestamp: number): string => {
    if (typeof unixTimestamp !== 'number' || isNaN(unixTimestamp)) {
      return 'Invalid Date';
    }

    const date = new Date(unixTimestamp * 1000);

    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    const getDaySuffix = (day: number): string => {
      if (day > 3 && day < 21) return 'th'; 
      switch (day % 10) {
        case 1:  return 'st';
        case 2:  return 'nd';
        case 3:  return 'rd';
        default: return 'th';
      }
    };

    return `${monthName} ${day}${getDaySuffix(day)} ${year}`;
};

const DealRow: React.FC<GameRowProp> = ({ deal, storeInfo }) => {
    
    const CHEAPSHARK_IMG_BASE_URL = "https://www.cheapshark.com";

    return (
        <tr className="border-b border-gray-700 hover:bg-gray-800 transition-colors duration-200">
            
            <td className="px-4 py-3 whitespace-nowrap text-center">
                {storeInfo ? ( 
                    <div className="flex items-center justify-center flex-col">
                        <Image
                            src={`${CHEAPSHARK_IMG_BASE_URL}${storeInfo.images.logo}`} 
                            alt={storeInfo.storeName}
                            className="w-8 h-8 object-contain rounded-full"
                            width={32}
                            height={32}
                        />
                        <span className="text-gray-400 text-xs mt-1 cursor-pointer">
                            {storeInfo.storeName} 
                        </span>
                    </div>
                ) : (
                    <span className="text-gray-500 text-sm">Store ID: {deal.storeID}</span>
                )}
            </td>

            
            <td className="px-4 py-3 whitespace-nowrap text-center">
                <div className="flex flex-col items-center">
                    <span className="text-sm line-through text-gray-500">${deal.normalPrice}</span>
                    <span className="text-lg font-bold text-blue-400">${deal.salePrice}</span>
                </div>
            </td>

            
            <td className="px-4 py-3 flex items-center space-x-3">
                <Image src={deal.thumb} alt={deal.title} className="w-16 h-8 object-cover rounded" width={64} height={32} />
                <GameNameClickable
                    title={deal.title}
                    metacriticLink={deal.metacriticLink}
                />
            </td>

            
            <td className="px-4 py-3 whitespace-nowrap text-center text-yellow-400 font-bold">
                {deal.dealRating || 'N/A'}
            </td>

            <td className="px-4 py-3 whitespace-nowrap text-center text-gray-300 flex items-center justify-center h-full">
                {deal.releaseDate ? formatReleaseDate(deal.releaseDate) : 'N/A'}
            </td>
        </tr>
    );
}

export default DealRow;