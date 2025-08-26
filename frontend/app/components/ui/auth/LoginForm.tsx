"use client";

import React, { useState } from "react";
import Button from "../common/Button";
import Link from "next/link";
import LoginIcon from "../../icons/LoginIcon";
import EyeToggle from "../common/EyeToggle";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "Error" | "Success" | "Info" | "" }>({
    message: "",
    type: "",
  });

  const { accessToken, loading: authLoading, setAccessToken } = useAuth();
  const router = useRouter();

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  console.log(serverUrl);

  async function sendToBackend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (authLoading) {
      setFeedback({ message: "Checking login status, please wait...", type: "Info" });
      return;
    }
    if (accessToken) {
      setFeedback({ message: "You are already logged in.", type: "Info" });
      return; 
    }

    try {
      const response = await fetch(`${serverUrl}api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setFeedback({ message: result.message || "Login failed", type: "Error" });
        return;
      }

      if (result.accessToken) {
        setAccessToken(result.accessToken);
      }

      // setFeedback({ message: result.message || "Login successful!", type: "Success" });
      setEmail("");
      setPassword("");
      router.push("/");
    } catch (error) {
      console.error("Login Error:", error);
      setFeedback({ message: "Network error: Could not reach server", type: "Error" });
    }
  }

  return (
    <main className="flex justify-center items-center pt-20 px-4">
      <div className="w-full max-w-md">
        <form
          className="border-gray-900 rounded-xl p-8 flex flex-col gap-6 shadow-2xl"
          style={{ backgroundColor: "#0b1226" }}
          onSubmit={sendToBackend}
        >
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-100 mb-2">Login to GameDex</h1>
            <p className="text-sm text-gray-400">
              Enter your credentials to sign in to your account.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFeedback({ message: "", type: "" }); }}
              className="rounded-lg border border-gray-700 bg-gray-800 text-gray-100 px-4 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-gray-500 transition-colors"
              placeholder="name@example.com"
            />
          </div>

          <div className="flex flex-col gap-2 relative">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
            <input
              type={isPasswordVisible ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFeedback({ message: "", type: "" }); }}
              className="rounded-lg border border-gray-700 bg-gray-800 text-gray-100 px-4 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-gray-500 transition-colors"
              placeholder="••••••••"
            />
            <div className="absolute right-4 top-8.5">
              <EyeToggle isVisible={isPasswordVisible} toggle={() => setIsPasswordVisible(!isPasswordVisible)} />
            </div>
          </div>

          {feedback.message && (
            <div className={`p-3 rounded text-center font-semibold ${feedback.type === "Error" ? "bg-red-100 text-red-700 border border-red-400" : "bg-green-100 text-green-700 border border-green-400"}`}>
              {feedback.message}
            </div>
          )}

          <Button variant="default" size="lg" className="w-full mt-2 flex items-center justify-center gap-2 bg-gray-950 h-12">
            <LoginIcon className="w-5 h-5" />
            Login
          </Button>

          <div className="border-t border-gray-700 my-2"></div>

          <p className="text-sm text-center text-gray-400">
            Don&apos;t have an account? <Link href="/signup" className="text-gray-400 underline">Sign Up</Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default LoginForm;