import React from 'react'

export interface Deal {
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
    <div className='flex'>
      <img src={deal.thumb} alt={deal.title} />
      <h1>{deal.title}</h1>
      <span>{deal.salePrice}</span>
      <span>{deal.salePrice}</span>
    </div>
  )
}

export default DealRow
