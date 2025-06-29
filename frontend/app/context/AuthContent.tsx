"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  loading: true,
});

// by default this is what the authentication is like

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch("http://localhost:4000/api/auth/refresh", {
          method: "GET",
          credentials: "include", // Sends the refresh token cookie
        });

        const data = await res.json();

        if (res.ok && data.accessToken) {
          setAccessToken(data.accessToken);
        } else {
          setAccessToken(null);
        }
      } catch (err) {
        console.error("Token refresh failed", err);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, loading }}>
      {children}
    </AuthContext.Provider>
    // This is how React Context API works. A Provider makes a value available to all child components in the component tree.

// You're wrapping your app (or part of it) with this provider so that any component can use useAuth() to access the auth state.
  );
};

export const useAuth = () => useContext(AuthContext);
