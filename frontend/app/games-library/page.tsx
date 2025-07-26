import React from 'react';
import HomeNavBar from '../components/ui/navigation/HomeNavBar';
import LibraryList from '../components/ui/games/LibraryList'; // Import your LibraryList component

const LibraryPage: React.FC = () => {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen"> {/* Apply background and text color to the entire page */}
      <HomeNavBar />
      <main className="container mx-auto px-4 py-8"> {/* Use a container for content, add padding */}
        {/*
          The LibraryList component handles its own internal loading,
          error messages, and "empty library" states.
          It will also apply its own background within its component,
          but the overall page background is set above for consistency.
        */}
        <LibraryList />
      </main>
    </div>
  );
}

export default LibraryPage;