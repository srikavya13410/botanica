import React from 'react';
import { AppView } from '../types';

interface BottomNavProps {
  activeView: AppView;
  setActiveView: (view: AppView, payload?: any) => void;
}

// Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const NavItem: React.FC<{ icon: React.ReactElement; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 h-12 rounded-full transition-all duration-300 ${isActive ? 'text-brand-yellow' : 'text-brand-cream hover:text-brand-yellow/80'}`}>
        {icon}
        <span className="text-xs mt-1">{label}</span>
    </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  // Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  const navItems: { view: AppView; label: string; icon: React.ReactElement }[] = [
    { view: 'dashboard', label: 'Home', icon: <HomeIcon /> },
    { view: 'myGarden', label: 'My Garden', icon: <GardenIcon /> },
    { view: 'aiGuide', label: 'Guide', icon: <GuideIcon /> },
    { view: 'recommendations', label: 'For You', icon: <RecommendIcon /> },
    { view: 'encyclopedia', label: 'Discover', icon: <BookIcon /> },
  ];

  return (
    <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center md:hidden">
      <div className="w-auto max-w-sm bg-brand-green/95 backdrop-blur-sm shadow-lg rounded-full flex justify-around items-center px-2 py-1 space-x-1">
        {navItems.map(item => (
          <NavItem 
            key={item.view}
            label={item.label}
            icon={item.icon}
            isActive={activeView === item.view}
            onClick={() => setActiveView(item.view)}
          />
        ))}
      </div>
    </div>
  );
};

// SVG Icons defined within the component for simplicity
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const GardenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10a4 4 0 014-4h10a4 4 0 014 4v10a2 2 0 01-2 2H5a2 2 0 01-2-2v-10zm1.75-5.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM19.25 4.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM9 14l3-3 3 3m-6 0v4h6v-4" />
  </svg>
);
const GuideIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a6 6 0 00-6 6c0 1.887.824 3.555 2.08 4.673.22.163.34.42.34.698V15a1 1 0 001 1h5a1 1 0 001-1v-1.629c0-.278.12-.535.34-.698A5.968 5.968 0 0016 8a6 6 0 00-6-6z" />
      <path d="M10 18a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1z" />
    </svg>
);
const RecommendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

export default BottomNav;