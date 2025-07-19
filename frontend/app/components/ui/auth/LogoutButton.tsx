"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Button from "../common/Button";

const LogoutButton = () => {
  const { setAccessToken } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setAccessToken(null);
        router.push("/login"); // or use "/" if you prefer going home
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Button variant="destructive" size="lg" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
