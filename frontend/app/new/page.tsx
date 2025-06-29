import React from 'react'
import RequireAuth from '../components/RequireAuth'
import HomeNavBar from '../components/ui/HomeNavBar'

const TestingPage = () => {
  return (
    <RequireAuth>
      <main className="min-h-screen flex flex-col">
      <HomeNavBar />

      <section className="flex-grow bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-4">
        <div className="max-w-3xl text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-100">
            Congratulations!          </h1>

          <p className="text-blue-400 text-lg">
            You are logged in and can view this page!
          </p>
        </div>
      </section>
    </main>
    </RequireAuth>
    
  )
}

export default TestingPage
