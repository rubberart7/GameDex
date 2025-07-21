// frontend/app/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

// 1. UPDATED: Add fetchNewAccessToken to the AuthContextType interface
interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  loading: boolean;
  fetchNewAccessToken: () => Promise<string | null>; // This function will trigger a refresh and return the new token
}

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  loading: true,
  fetchNewAccessToken: async () => null, // Default empty implementation for createContext
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. REVERTED: fetchNewAccessToken function is back to its simpler form
  // It will always attempt to fetch a new token from the backend when called.
  const fetchNewAccessToken = async (): Promise<string | null> => {
    try {
      const res = await fetch("http://localhost:4000/api/auth/refresh", {
        method: "GET",
        credentials: "include", // Sends the refresh token cookie
      });

      const data = await res.json();

      if (res.ok && data.accessToken) {
        setAccessToken(data.accessToken); // Update the state within the context
        return data.accessToken; // Return the new token so the caller can use it
      } else {
        setAccessToken(null); // Clear token if refresh failed (e.g., refresh token expired/invalid)
        return null; // Indicate failure to obtain a new token
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
      setAccessToken(null);
      return null;
    }
  };

  // 3. UPDATED: Call the new fetchNewAccessToken function during initial mount
  useEffect(() => {
    async function initAuth() {
      await fetchNewAccessToken(); // Perform the initial token fetch when the app loads
      setLoading(false); // Set loading to false only after the initial fetch attempt is complete
    }

    initAuth();
  }, []); // Empty dependency array means it runs once on mount

  return (
    // 4. UPDATED: Provide the fetchNewAccessToken function via the context value
    <AuthContext.Provider value={{ accessToken, setAccessToken, loading, fetchNewAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);