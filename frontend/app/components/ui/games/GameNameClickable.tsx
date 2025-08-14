
"use client"; 

import React from 'react';

export interface GameNameClickableProps {
    title: string;
    metacriticLink?: string;
}

const METACRITIC_BASE_URL = "https://www.metacritic.com";

const GameNameClickable: React.FC<GameNameClickableProps> = ({ title, metacriticLink }) => {

    const handleNameClick = (e: React.MouseEvent<HTMLHeadingElement>) => {
        
        e.stopPropagation();

        if (metacriticLink) {
            const fullMetacriticUrl = `${METACRITIC_BASE_URL}${metacriticLink}`;
            window.open(fullMetacriticUrl, '_blank');
        } else {
            console.warn(`No Metacritic link available for "${title}"`);
        }
    };

    return (
        <h2
            className="text-gray-100 font-medium text-base text-left cursor-pointer hover:underline"
            onClick={handleNameClick}
        >
            {title}
        </h2>
    );
}

export default GameNameClickable;