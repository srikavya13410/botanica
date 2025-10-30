import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MyGarden from './components/MyGarden';
import Reminders from './components/Reminders';
import Recommendations from './components/Recommendations';
import Encyclopedia from './components/Encyclopedia';
import Warnings from './components/Warnings';
import AIGuide from './components/AIGuide';
import BottomNav from './components/BottomNav';
import { User, AppView, Plant, Reminder } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [encyclopediaQuery, setEncyclopediaQuery] = useState('');
  
  const [myPlants, setMyPlants] = useState<Plant[]>(() => {
    try {
      const savedPlants = localStorage.getItem('botanica-my-garden');
      return savedPlants ? JSON.parse(savedPlants) : [];
    } catch (e) {
      console.error("Failed to load plants from storage", e);
      return [];
    }
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const storedRemindersJSON = localStorage.getItem('botanica-reminders');
      if (storedRemindersJSON) {
        // Corrected the type annotation to properly represent an array of reminder objects. The original type was being interpreted incorrectly by TypeScript.
        const storedReminders: (Omit<Reminder, 'time'> & {time: string})[] = JSON.parse(storedRemindersJSON);
        // Parse dates and filter out past reminders upon loading
        return storedReminders
          .map(r => ({ ...r, time: new Date(r.time) }))
          .filter(r => r.time > new Date())
          .sort((a,b) => a.time.getTime() - b.time.getTime());
      }
      return [];
    } catch (e) {
      console.error("Failed to load reminders from storage", e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('botanica-my-garden', JSON.stringify(myPlants));
    } catch (e) {
      console.error("Failed to save plants to storage", e);
    }
  }, [myPlants]);

  useEffect(() => {
    try {
      // Don't store timeoutId in localStorage
      const remindersToStore = reminders.map(({ timeoutId, ...rest }) => ({
        ...rest,
        time: rest.time.toISOString(),
      }));
      localStorage.setItem('botanica-reminders', JSON.stringify(remindersToStore));
    } catch (e) {
      console.error("Failed to save reminders to storage", e);
    }
  }, [reminders]);
  
  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const addPlantToGarden = (plant: Plant) => {
    // Avoid adding duplicates
    if (!myPlants.some(p => p.name.toLowerCase() === plant.name.toLowerCase())) {
        setMyPlants(prevPlants => [...prevPlants, plant]);
    }
  };

  const addReminder = (reminder: Omit<Reminder, 'id' | 'timeoutId'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
    };
    setReminders(prev => [...prev, newReminder].sort((a, b) => a.time.getTime() - b.time.getTime()));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const handleViewChange = (view: AppView, payload?: any) => {
    if (view === 'encyclopedia' && typeof payload === 'string') {
        setEncyclopediaQuery(payload);
    } else if (activeView === 'encyclopedia') {
        // Clear query when navigating away from encyclopedia
        setEncyclopediaQuery('');
    }
    setActiveView(view);
  };

  const renderActiveView = () => {
    if (!user) return null;
    switch (activeView) {
      case 'dashboard':
        return <Dashboard user={user} myPlants={myPlants} reminders={reminders} setActiveView={handleViewChange} />;
      case 'myGarden':
        return <MyGarden myPlants={myPlants} addPlantToGarden={addPlantToGarden} onLearnMore={(plantName) => handleViewChange('encyclopedia', plantName)} />;
      case 'reminders':
        return <Reminders myPlants={myPlants} reminders={reminders} addReminder={addReminder} deleteReminder={deleteReminder} />;
      case 'recommendations':
        return <Recommendations user={user} myPlants={myPlants} addPlantToGarden={addPlantToGarden} />;
      case 'warnings':
        return <Warnings user={user} />;
      case 'aiGuide':
        return <AIGuide user={user} />;
      case 'encyclopedia':
        return <Encyclopedia initialQuery={encyclopediaQuery} clearInitialQuery={() => setEncyclopediaQuery('')} />;
      default:
        return <Dashboard user={user} myPlants={myPlants} reminders={reminders} setActiveView={handleViewChange} />;
    }
  };

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="font-sans bg-brand-cream min-h-screen">
      <header className="bg-brand-green text-white p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="w-1/5">
            {activeView !== 'dashboard' && (
              <button 
                onClick={() => handleViewChange('dashboard')} 
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Back to home"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
          <div className="w-3/5 text-center">
            <h1 className="text-2xl font-bold font-serif">Botanica</h1>
          </div>
          <div className="w-1/5 text-right">
            <p className="font-semibold truncate">{user.username}</p>
            <p className="text-sm opacity-80 truncate">{user.medicalCondition}</p>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 pb-24">
        {renderActiveView()}
      </main>
      
      <BottomNav activeView={activeView} setActiveView={handleViewChange} />
    </div>
  );
};

export default App;