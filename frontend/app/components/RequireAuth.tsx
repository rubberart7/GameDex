// components/RequireAuth.tsx
"use client";

import { useAuth } from "@/app/context/AuthContent"; // adjust path as needed
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { accessToken, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !accessToken) {
      router.push("/need-login"); // redirect if not authenticated
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
