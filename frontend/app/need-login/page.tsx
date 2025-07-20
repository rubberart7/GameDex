import React from "react";
import HomeNavBar from "../components/ui/navigation/HomeNavBar";

export default function NeedLogin() {
  return (
    <main className="min-h-screen flex flex-col">
      <HomeNavBar />

      <section className="flex-grow bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-4">
        <div className="max-w-3xl text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-100">
            You need to be logged in to perform this action.
          </h1>

          <p className="text-blue-400 text-lg">
            Please login to access this content.
          </p>
        </div>
      </section>
    </main>
  );
}
