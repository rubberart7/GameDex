"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  loading: boolean;
  fetchNewAccessToken: (forceRefresh?: boolean) => Promise<string | null>;
  accessTokenExpiration: number | null;
  // userCollectionsVersion signals changes in library/wishlist to trigger recommendations re-fetch
  userCollectionsVersion: number;
  incrementUserCollectionsVersion: () => void;
}

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  loading: true,
  fetchNewAccessToken: async () => null,
  accessTokenExpiration: null,
  userCollectionsVersion: 0, 
  incrementUserCollectionsVersion: () => {}, 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessTokenExpiration, setAccessTokenExpiration] = useState<number | null>(null);
  
  const [userCollectionsVersion, setUserCollectionsVersion] = useState(0);

  const incrementUserCollectionsVersion = () => {
    setUserCollectionsVersion(prev => prev + 1);
  };

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  const decodeAndSetToken = (token: string | null) => {
    if (!token) {
      setAccessToken(null);
      setAccessTokenExpiration(null);
      return;
    }
    try {
      const decoded: JwtPayload = jwtDecode(token);
      if (decoded.exp) {
        setAccessTokenExpiration(decoded.exp);
      } else {
        setAccessTokenExpiration(null);
      }
      setAccessToken(token);
    } catch (err) {
      console.error("Error", err);
      setAccessToken(null);
      setAccessTokenExpiration(null);
    }
  };

  const isAccessTokenExpired = (): boolean => {
    if (!accessToken || !accessTokenExpiration) {
      return true;
    }
    const currentTime = Date.now() / 1000;
    return accessTokenExpiration < currentTime + 30;
  };

  const fetchNewAccessToken = async (forceRefresh: boolean = false): Promise<string | null> => {
    if (!forceRefresh && accessToken && !isAccessTokenExpired()) {
      return accessToken;
    }

    try {
      const res = await fetch(`${serverUrl}api/auth/refresh`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.accessToken) {
        decodeAndSetToken(data.accessToken);
        return data.accessToken;
      } else {
        decodeAndSetToken(null);
        return null;
      }
    } catch (err) {
      console.error("Error", err)
      decodeAndSetToken(null);
      return null;
    }
  };

  useEffect(() => {
    async function initAuth() {
      await fetchNewAccessToken(true);
      setLoading(false);
    }

    initAuth();
  }, [fetchNewAccessToken]);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, loading, fetchNewAccessToken, accessTokenExpiration, userCollectionsVersion, incrementUserCollectionsVersion }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);