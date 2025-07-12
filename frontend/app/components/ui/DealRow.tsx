import React from 'react'

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
}

const DealRow: React.FC<GameRowProp>= ( { deal } ) => {
  return (
        <tr className="border-b border-gray-700 hover:bg-gray-800 transition-colors duration-200">
            {/* Store Icon/Name */}
            <td className="px-4 py-3 whitespace-nowrap text-center">
                <span className="text-gray-400 text-sm">{deal.storeID || 'N/A'}</span>
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

export default DealRow
