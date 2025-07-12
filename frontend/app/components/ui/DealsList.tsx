import React from 'react';
import DealRow, { Deal } from './DealRow';

const DealsList = async () => {

    const res = await fetch('http://localhost:4000/api/deals'); 
    if (!res.ok) {
        throw new Error('Failed to fetch deals!');
    }
    const deals: Deal[] = await res.json();
    // treats as an array of deal objects

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
                        {deals.map((deal) => (
                            <DealRow key={deal.dealID} deal={deal} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DealsList
