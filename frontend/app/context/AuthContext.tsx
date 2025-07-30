// frontend/app/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode"; // NEW: Import jwt-decode library

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  loading: boolean;
  fetchNewAccessToken: (forceRefresh?: boolean) => Promise<string | null>; // UPDATED: Added optional forceRefresh parameter
  accessTokenExpiration: number | null; // NEW: Expose expiration timestamp
  // You could also expose an isAccessTokenValid helper here if needed:
  // isAccessTokenValid: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  loading: true,
  fetchNewAccessToken: async () => null,
  accessTokenExpiration: null, // Default value
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // NEW: State to store the expiration timestamp (Unix timestamp in seconds)
  const [accessTokenExpiration, setAccessTokenExpiration] = useState<number | null>(null);

  // NEW: Helper function to decode token and set state
  const decodeAndSetToken = (token: string | null) => {
    if (!token) {
      setAccessToken(null);
      setAccessTokenExpiration(null);
      return;
    }
    try {
      const decoded: JwtPayload = jwtDecode(token);
      // 'exp' is a Unix timestamp in seconds
      if (decoded.exp) {
        setAccessTokenExpiration(decoded.exp);
      } else {
        setAccessTokenExpiration(null); // No expiration found
      }
      setAccessToken(token); // Set the token itself
    } catch (err) {
      console.error("Failed to decode token, it might be invalid:", err);
      setAccessToken(null);
      setAccessTokenExpiration(null);
    }
  };

  // NEW: Helper function to check if the current access token is expired or close to expiring
  const isAccessTokenExpired = (): boolean => {
    if (!accessToken || !accessTokenExpiration) {
      // If there's no token or no expiration stored, it's considered expired/invalid
      return true;
    }
    const currentTime = Date.now() / 1000; // Current time in seconds
    // Return true if current time is past expiration. Adding a small buffer (e.g., 30 seconds)
    // to proactively refresh before it *actually* expires, avoiding 401s on subsequent requests.
    return accessTokenExpiration < currentTime + 30;
  };

  // UPDATED: fetchNewAccessToken function now has intelligent check
  const fetchNewAccessToken = async (forceRefresh: boolean = false): Promise<string | null> => {
    // If not forcing refresh, AND a token exists, AND that token is NOT expired,
    // then just return the current valid token from memory without hitting the backend.
    if (!forceRefresh && accessToken && !isAccessTokenExpired()) {
      return accessToken;
    }

    try {
      const res = await fetch("http://localhost:4000/api/auth/refresh", {
        method: "GET",
        credentials: "include", // Sends the refresh token cookie
      });

      const data = await res.json();

      if (res.ok && data.accessToken) {
        decodeAndSetToken(data.accessToken); // Use the new helper to set token and its expiration
        return data.accessToken;
      } else {
        decodeAndSetToken(null); // Clear token if refresh failed
        return null;
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
      decodeAndSetToken(null); // Clear token on network error
      return null;
    }
  };

  // UPDATED: Call the new fetchNewAccessToken function during initial mount
  useEffect(() => {
    async function initAuth() {
      // On initial app load, always attempt to get a token (even if accessToken is null in memory,
      // a valid refresh token might be in the cookie).
      // We pass `true` to force a refresh check on initial load.
      await fetchNewAccessToken(true);
      setLoading(false); // Set loading to false only after the initial fetch attempt is complete
    }

    initAuth();
  }, []); // Empty dependency array means it runs once on mount

  return (
    // UPDATED: Provide the new accessTokenExpiration via the context value
    <AuthContext.Provider value={{ accessToken, setAccessToken, loading, fetchNewAccessToken, accessTokenExpiration }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);