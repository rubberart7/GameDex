"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  loading: boolean;
  fetchNewAccessToken: (forceRefresh?: boolean) => Promise<string | null>;
  accessTokenExpiration: number | null;
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

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  const incrementUserCollectionsVersion = () => {
    setUserCollectionsVersion(prev => prev + 1);
  };

  const decodeAndSetToken = useCallback((token: string | null) => {
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
      console.error("Error decoding token:", err);
      setAccessToken(null);
      setAccessTokenExpiration(null);
    }
  }, []);

  const isAccessTokenExpired = useCallback((): boolean => {
    if (!accessToken || !accessTokenExpiration) {
      return true;
    }
    const currentTime = Date.now() / 1000;
    return accessTokenExpiration < currentTime + 30; // 30 second buffer
  }, [accessToken, accessTokenExpiration]);

  const fetchNewAccessToken = useCallback(async (forceRefresh: boolean = false): Promise<string | null> => {
    // Don't fetch if we have a valid token and not forcing refresh
    if (!forceRefresh && accessToken && !isAccessTokenExpired()) {
      return accessToken;
    }

    if (!serverUrl) {
      console.error('Server URL not configured');
      return null;
    }

    try {
      console.log('Attempting to refresh access token...');
      
      const res = await fetch(`${serverUrl}/api/auth/refresh`, {
        method: "GET",
        credentials: "include", // Important: This sends cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Refresh response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.log('Refresh failed:', errorText);
        decodeAndSetToken(null);
        return null;
      }

      const data = await res.json();
      console.log('Refresh successful');

      if (data.accessToken) {
        decodeAndSetToken(data.accessToken);
        return data.accessToken;
      } else {
        console.log('No access token in response');
        decodeAndSetToken(null);
        return null;
      }
    } catch (err) {
      console.error("Error fetching refresh token:", err);
      decodeAndSetToken(null);
      return null;
    }
  }, [serverUrl, accessToken, isAccessTokenExpired, decodeAndSetToken]);

  // Initialize authentication on component mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        console.log('Initializing authentication...');
        const token = await fetchNewAccessToken(true);
        
        if (isMounted) {
          if (token) {
            console.log('Authentication successful');
          } else {
            console.log('No valid refresh token found');
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  // Auto-refresh token before it expires
  useEffect(() => {
    if (!accessToken || !accessTokenExpiration) return;

    const timeUntilExpiry = (accessTokenExpiration * 1000) - Date.now() - (5 * 60 * 1000); // Refresh 5 minutes before expiry
    
    if (timeUntilExpiry <= 0) return; // Already expired or about to expire

    const timeoutId = setTimeout(() => {
      console.log('Auto-refreshing token...');
      fetchNewAccessToken(true);
    }, timeUntilExpiry);

    return () => clearTimeout(timeoutId);
  }, [accessToken, accessTokenExpiration, fetchNewAccessToken]);

  // Enhanced setAccessToken function
  const enhancedSetAccessToken = useCallback((token: string | null) => {
    decodeAndSetToken(token);
  }, [decodeAndSetToken]);

  const contextValue = {
    accessToken,
    setAccessToken: enhancedSetAccessToken,
    loading,
    fetchNewAccessToken,
    accessTokenExpiration,
    userCollectionsVersion,
    incrementUserCollectionsVersion,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);