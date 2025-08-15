// Define the interfaces for nested objects first
export interface Platform {
  id: number;
  name: string;
  slug: string;
}

export interface PlatformObj {
  platform: Platform;
}

export interface Developer {
  id: number;
  name: string;
  slug: string;
}

export interface Publisher {
  id: number;
  name: string;
  slug: string;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface EsrbRating {
  id: number;
  name: string;
  slug: string;
}

export interface Screenshot {
  id: number;
  image: string;
}

export interface Clip {
  clip: string;
  preview: string;
}

// Main interface that matches the backend's response for a single game
export interface GameDetailsData {
  id: number;
  slug: string;
  name: string;
  background_image: string;
  background_image_additional: string;
  description_raw: string;
  released: string | null;
  rating: number | null;
  metacritic: number | null;
  platforms: PlatformObj[];
  genres: Genre[];
  developers: Developer[];
  publishers: Publisher[];
  esrb_rating: EsrbRating | null;
  clip: Clip | null;
  short_screenshots: Screenshot[]; // The screenshots array
  // Add other properties if your backend sends them
}