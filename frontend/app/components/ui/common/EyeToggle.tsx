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

export default EyeToggle;