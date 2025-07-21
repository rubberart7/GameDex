"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/utils/cn"; // Assuming this path is correct for your `cn` utility
import LoadingSpinner from "./LoadingSpinner"; // <-- IMPORT THE LOADING SPINNER HERE

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white hover:bg-blue-700 flex gap-2 focus:ring-blue-500",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        outline:
          "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500",
        ghost:
          "bg-transparent text-blue-400 hover:bg-blue-800/20 focus:ring-blue-500",
        link:
          "text-blue-400 underline-offset-4 hover:underline focus:ring-blue-500",
        signup:
          "bg-slate-800 text-white hover:bg-slate-900 focus:slate-700 flex gap-2",
        addToWishList:
          "w-full py-3 mb-6 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white rounded-md font-semibold transition duration-200 shadow-sm",
        addToLibrary:
          "w-full py-3 mb-3 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold text-white transition duration-200 shadow-md"
      },
      size: {
        sm: "px-3 py-1.5 text-sm rounded-lg",
        md: "px-4 py-2 text-base rounded-lg",
        lg: "px-6 py-3 text-lg rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// Extend the ButtonProps type to include our custom 'loading' and 'loadingText' props
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean; // New prop: if true, show spinner and disable button
    loadingText?: string; // Optional new prop: text to show when loading (defaults to "Loading...")
  };

const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  loading,       // Destructure the 'loading' prop
  loadingText,   // Destructure the 'loadingText' prop
  children,      // Destructure 'children' so we can conditionally render it
  ...props       // Rest of the HTML button props (like onClick, disabled, etc.)
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={props.disabled || loading} // Disable button if its own disabled prop is true OR if loading
      {...props} // Pass through all other standard button props
    >
      {loading ? ( // Conditional rendering: if 'loading' is true
        <>
          <LoadingSpinner className="mr-2" /> {/* Use the imported LoadingSpinner component */}
          {loadingText || "Loading..."} {/* Render custom loadingText or default */}
        </>
      ) : (
        children // Otherwise, render the original children (button text/content)
      )}
    </button>
  );
};

export default Button;