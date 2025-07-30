import React from 'react';
import WishList from '../components/ui/games/WishList'; 
import MainNavBar from '../components/ui/navigation/MainNavBar';

const WishlistPage: React.FC = () => { 
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <MainNavBar />
      <main className="container mx-auto px-4 py-8 flex flex-col">
        <section className="mb-8 pb-4 border-b border-slate-800 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-2">My Wishlist</h1> 
          <p className="text-lg text-gray-400">Games you're tracking, waiting for the perfect deal.</p> 
        </section>
        <WishList /> 
      </main>
    </div>
  );
}

export default WishlistPage; 