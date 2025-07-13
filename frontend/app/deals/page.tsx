import React from 'react';
import DealsList from '../components/ui/DealsList';
import HomeNavBar from '../components/ui/HomeNavBar';

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
