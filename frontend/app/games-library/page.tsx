import React from 'react';
import LibraryList from '../components/ui/games/LibraryList';
import MainNavBar from '../components/ui/navigation/MainNavBar';

const LibraryPage: React.FC = () => {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <MainNavBar></MainNavBar>
      <main className="container mx-auto px-4 py-8 flex flex-col">
        <section className="mb-8 pb-4 border-b border-slate-800 flex flex-col items-center"> 
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-2">My Library</h1> 
          <p className="text-lg text-gray-400">All your owned games, ready to view and manage. </p>
        </section>
        <LibraryList />
      </main>
    </div>
  );
}

export default LibraryPage;