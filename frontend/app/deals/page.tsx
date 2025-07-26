import React from 'react';
import DealsList from '../components/ui/deals/DealsList';
import MainNavBar from '../components/ui/navigation/MainNavBar';

const DealsPage = () => {
  return (
    <main>
      <MainNavBar></MainNavBar>

      <section className="flex h-screen bg-slate-950">
        <DealsList></DealsList>
      </section>
    </main>
  )
}

export default DealsPage;
