import React from "react";
import Button from "./components/ui/common/Button";
import HomeNavBar from "./components/ui/navigation/HomeNavBar";
import Link from "next/link";
import LogoutButton from "./components/ui/auth/LogoutButton";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <HomeNavBar />  

      <section className="flex-grow bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-4">
        <div className="max-w-3xl text-center space-y-6">
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
            <Link href="/login">
              <Button variant="default" size="lg">
                Login
              </Button>
            </Link>

            <Link href="/main">
              <Button variant="ghost" size="lg">
                Continue as Guest
              </Button>
            </Link>

            <Link href="/signup">
              <Button variant="outline" size="lg">
                Get Started
              </Button>
            </Link>

            <Link href="/new">
              <Button variant="default" size="lg">
                Check New Page
              </Button>
            </Link>
            
            <LogoutButton>
              
            </LogoutButton>
            
          </div>
        </div>
      </section>
    </main>
  );
}

