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
        <div>
            {deals.map((deal) => (
                <DealRow key={deal.dealID} deal={deal}/>
            ))}
        </div>
    )
}

export default DealsList
