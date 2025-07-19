// components/RequireAuth.tsx
"use client";

import { useAuth } from "@/app/context/AuthContext"; // adjust path as needed
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
//   You're creating a React component that:

// Receives a children prop, which is any JSX nested inside it.

// Returns JSX depending on whether the user is authenticated.

// 🔸 Prop Breakdown
// Prop	Type	Meaning
// children	React.ReactNode	Anything valid in JSX (component, div, text, etc.). You show this only if the user is authenticated.
  const { accessToken, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !accessToken) {
      router.push("/need-login"); // redirect if not authenticated
      // “Only run the effect when one of these values changes and then continues down the function"
      // if you left it as an empty array it would only run once
    }
  }, [accessToken, loading, router]);

  if (loading || !accessToken) {
    return <div>Loading...</div>; // or show a spinner
  }

  return <>{children}</>;
}

// The { children }: { children: React.ReactNode } part in the function parameters is TypeScript syntax for destructuring props. It means:

// The component expects a prop named children.

// The children can be any valid React content — a component, some JSX, te+xt, fragments, arrays of elements, etc.

// React.ReactNode is the broadest type that represents anything React can render.

// Later in the code, when you do:

// tsx
// Copy
// Edit
// return <>{children}</>;
// it simply renders whatever was passed inside <RequireAuth>...</RequireAuth>.
