import React from 'react';
import DealsList from '../components/ui/deals/DealsList';
import HomeNavBar from '../components/ui/navigation/HomeNavBar';

const DealsPage = () => {
  return (
    <main>
      <HomeNavBar></HomeNavBar>

      <section className="flex h-screen bg-slate-950">
        <DealsList></DealsList>
      </section>
    </main>
  )
}

export default DealsPage;
