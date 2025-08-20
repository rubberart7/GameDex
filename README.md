# GameDex
A full-stack video game deal aggregation and recommendation platform built with Next.js, React, TypeScript, and an Express.js backend. This application allows users to discover game deals, manage their personal library and wishlist, and receive AI-powered game recommendations based on their interests.

---

## 🚀 Live Demo
**Frontend:** [https://game-dex-t4vi.vercel.app/](https://game-dex-t4vi.vercel.app/)  
**Backend:** [https://gamedex-h1hb.onrender.com](https://gamedex-h1hb.onrender.com)

---

## 🛠️ Built With  
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node-dot-js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)

---

## 💻 Tech Stack  
- **Client:** React, Next.js, TypeScript, Tailwind CSS, React-Toastify  
- **Server:** Node.js, Express.js, PostgreSQL, Prisma, bcrypt, JSON Web Tokens, Axios, cookie-parser  
- **APIs:** Google Gemini API, RAWG API, CheapShark API  

---

## ✨ Features
- **Game Discovery:** Browse a catalog of video games with details like cover art, ratings, and release dates.  
- **User Authentication:** Secure user registration, login, and logout using JWT and bcrypt for password hashing.  
- **Library and Wishlist Management:** Add games to your personal library or wishlist and view them on dedicated pages.  
- **AI-Powered Recommendations:** Get personalized game suggestions from a Google Gemini-powered AI, based on your library and wishlist preferences.  
- **Game Details:** View detailed information for each game, including screenshots and trailers, fetched from the RAWG API.  
- **Responsive Design:** The application is optimized for a seamless experience on both desktop and mobile devices.  

---

## ⚙️ Installation  

### Prerequisites
- Node.js (v18 or higher)  
- npm or yarn  
- PostgreSQL database (e.g., hosted on Supabase)  

### Getting Started
Clone the repository:
```bash
git clone https://github.com/your-username/your-gamedex-repo.git
cd gamedex-repo
Install backend dependencies:
bash
Copy
Edit
cd backend
npm install
Install frontend dependencies:
bash
Copy
Edit
cd ../frontend
npm install
🔐 Environment Variables
Backend (backend/.env)
env
Copy
Edit
# Database Connection
DATABASE_URL="postgresql://<user>:<password>@<your-supabase-host>:<port>/<db_name>?pgbouncer=true&pool_timeout=4000&pool_max=2"
DIRECT_URL="postgresql://<user>:<password>@<your-supabase-direct-host>:<port>/<db_name>"

# JWT Secrets
ACCESS_TOKEN_SECRET="a_very_long_and_random_string_for_access_tokens"
REFRESH_TOKEN_SECRET="a_very_long_and_random_string_for_refresh_tokens"

# API Keys
RAWG_API_KEY="your_rawg_api_key"
GEMINI_API_KEY="your_gemini_api_key"

# Frontend URL (for CORS)
CLIENT_URL="http://localhost:3000"
Frontend (frontend/.env.local)
env
Copy
Edit
NEXT_PUBLIC_BACKEND_URL="http://localhost:4000"
▶️ Run Locally
Backend
Navigate to the backend directory.

Run the Prisma migration to set up your database schema:

bash
Copy
Edit
npx prisma migrate dev --name init_database_schema
Start the development server:

bash
Copy
Edit
npm run dev
Frontend
Navigate to the frontend directory.

Start the development server:

bash
Copy
Edit
npm run dev
📁 Folder Structure
lua
Copy
Edit
.
├── backend/                  # Express.js backend application
│   ├── controllers/
│   ├── generated/
│   ├── libs/
│   ├── middleware/
│   ├── node_modules/
│   ├── prisma/
│   ├── random/
│   ├── routes/
│   ├── .env
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   ├── server.ts
│   └── tsconfig.json
├── frontend/                 # Next.js frontend application
│   ├── .next/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── components/
│   │   ├── library/
│   │   ├── recommendations/
│   │   └── layout.tsx
│   ├── node_modules/
│   ├── public/
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   └── README.md
🚀 Deployment
Backend (on Render)
Create a new Web Service on Render.

Connect your GitHub repository for the backend.

Set the Build Command: npm install && npx prisma generate && tsc

Set the Start Command: node dist/server.js

Add all necessary environment variables from your backend/.env file to the Render dashboard.

Frontend (on Vercel)
Import your GitHub repository into Vercel.

Set the project settings:

Framework: Next.js

Root Directory: frontend/

Add the necessary environment variables to the Vercel dashboard:

ini
Copy
Edit
NEXT_PUBLIC_BACKEND_URL = https://gamedex-h1hb.onrender.com
Vercel will automatically build and deploy your application.