"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Button from "../common/Button";
import { FiLogOut } from "react-icons/fi";

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
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      // Updated class names for a red color palette
      className="bg-red-600 text-white hover:bg-red-700 flex gap-2 focus:ring-red-500 rounded-lg px-4 py-2 text-base font-semibold"
    >
      <FiLogOut className="w-4 h-4" />
      Logout
    </Button>
  );
};

export default LogoutButton;