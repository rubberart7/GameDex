"use client";

import React from 'react';
import { Eye, EyeOff } from "lucide-react";

type EyeToggleProps = {
    isVisible: boolean,
    toggle: () => void;
}

const EyeToggle: React.FC<EyeToggleProps> = ({ isVisible, toggle }) => (
  <button type="button" onClick={toggle} className="focus:outline-none">
    {isVisible ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
  </button>
);

// <{ isVisible: boolean; toggle: () => void }>

// { isVisible: boolean; toggle: () => void } — This is the shape of the props object.

// isVisible: a prop of type boolean.

// toggle: a prop that’s a function with no parameters and no return value (() => void).

// Purpose: Type-checks the props that the component expects.
// a type is defined because a jsx is returned

// 📝 1. You must define a type when TypeScript cannot automatically infer it or when you want to be explicit.
// 👉 Examples:

// Function arguments and component props
// tsx
// Copy
// Edit
// const EyeToggle: React.FC<{ isVisible: boolean; toggle: () => void }> = ...
// Here, you’re telling TypeScript: “This component receives props shaped like this.”

// Complex or custom object shapes
// ts
// Copy
// Edit
// const user: { name: string; age: number } = { name: "Alice", age: 30 };
// TypeScript wouldn’t be able to fully infer the shape without a hint.


export default EyeToggle;
