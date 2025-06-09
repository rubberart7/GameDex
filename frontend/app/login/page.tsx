import React from 'react'
import HomeNavBar from '../components/ui/HomeNavBar';

const LoginPage = () => {
  return (
    <div>
      <main className='min-h-screen flex flex-col'>
        <HomeNavBar />
        <section className="flex-grow bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-4">
          <form action="post flex flex-col bg-slate-800">
            <div className='name-component'>
              <label htmlFor="name"></label>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default LoginPage;
