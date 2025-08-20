import React from 'react';
import RecommendationsList from '../components/ui/games/RecommendationsList'; 
import MainNavBar from '../components/ui/navigation/MainNavBar';

const RecommendationsPage: React.FC = () => { 
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <MainNavBar />
      <main className="container mx-auto px-4 py-8 flex flex-col">
        <section className="mb-8 pb-4 border-b border-slate-800 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-2">Recommended for You</h1> 
          <p className="text-lg text-gray-400">Personalized game suggestions based on your taste.</p> 
        </section>
        <RecommendationsList /> 
      </main>
    </div>
  );
}

export default RecommendationsPage; 