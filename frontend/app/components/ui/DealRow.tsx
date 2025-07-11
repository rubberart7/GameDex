import React from 'react'

export interface Deal {
    dealID: string;
    thumb: string;
    title: string;
    salePrice: string;
    normalPrice: string;
}

export interface GameRowProp {
    deal: Deal;
}

const DealRow: React.FC<GameRowProp>= ( { deal } ) => {
  return (
    <div className='flex gap-1'>
      <img src={deal.thumb} alt={deal.title} />
      <h1>{deal.title}</h1>
      <span>Sales Price: ${deal.salePrice}</span>
      <span>Normal Price: ${deal.normalPrice}</span>
    </div>
  )
}

export default DealRow
