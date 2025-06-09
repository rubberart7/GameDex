import React from "react";
import Button from "./components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-3xl text-center space-y-6 -mt-24">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text">
            GameDex
          </span>
        </h1>
        <p className="text-slate-400 text-lg">
          GameDex is your ultimate destination for discovering, tracking, and
          snagging the best deals on video games — all in one place. Dive into
          curated game listings, compare prices across top retailers, and never
          miss a sale again. Level up your gaming library without breaking the
          bank!
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Button variant="default" size="lg">
            Login
          </Button>

          <Button variant="outline" size="lg">
            Get Started
          </Button>

          <Button variant="ghost" size="lg">
            Continue as Guest
          </Button>
        </div>
      </div>
    </main>
  );
}
