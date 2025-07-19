"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  loading: boolean;
}

// This defines the shape of the context object. In other words, when you create the AuthContext, it must have these 3 things:

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  loading: true,
});

// creates the actual context with default initial values, in my case i wrapped the entire App with Auth Provider meaning it can be 
// used anywhere

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
// AuthProvider is a React functional component.

// It's being passed one prop: children.

// The prop type is defined inline using TypeScript:
// { children }: { children: React.ReactNode }
// children is whatever you wrap with <AuthProvider> in your JSX.

// React.ReactNode can be a component, string, element, etc.—basically any valid JSX content.

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch("http://localhost:4000/api/auth/refresh", {
          method: "GET",
          credentials: "include", // Sends the refresh token cookie
        });
        // 

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
  // use effect on first mount, runs only once when the component is mounted and gets the access token by hitting my backend

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, loading }}>
      {children}
    </AuthContext.Provider>
//  This is the core purpose of the AuthProvider: to provide the AuthContext to all nested components.

// It shares:

// accessToken: for checking if the user is logged in

// setAccessToken: for logging in/out or refreshing tokens

// loading: for showing loading spinners or preventing UI flickers

// Any child of <AuthProvider> now has access to this via usAuth()
  );
};

export const useAuth = () => useContext(AuthContext);
