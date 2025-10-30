import React, { useState, useEffect } from 'react';
import { User, Plant, Reminder, AppView } from '../types';
import * as geminiService from '../services/geminiService';
import Spinner from './common/Spinner';

// Icons copied from BottomNav for use in QuickAction buttons
const GardenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10a4 4 0 014-4h10a4 4 0 014 4v10a2 2 0 01-2 2H5a2 2 0 01-2-2v-10zm1.75-5.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM19.25 4.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM9 14l3-3 3 3m-6 0v4h6v-4" />
    </svg>
  );
  const ReminderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  const RecommendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
  const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);


interface DashboardProps {
  user: User;
  myPlants: Plant[];
  reminders: Reminder[];
  setActiveView: (view: AppView) => void;
}

const QuickActionButton: React.FC<{ icon: React.ReactElement, label: string, onClick: () => void, color: string }> = ({ icon, label, onClick, color }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center space-y-2 text-center group">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md ${color}`}>
      {icon}
    </div>
    <p className="text-sm font-semibold text-brand-brown group-hover:text-brand-green">{label}</p>
  </button>
);


const Dashboard: React.FC<DashboardProps> = ({ user, myPlants, reminders, setActiveView }) => {
  const [healthTip, setHealthTip] = useState('');
  const [isLoadingTip, setIsLoadingTip] = useState(true);

  useEffect(() => {
    const fetchTip = async () => {
      if (user.medicalCondition) {
        try {
          setIsLoadingTip(true);
          const tip = await geminiService.getHealthTip(user.medicalCondition);
          setHealthTip(tip);
        } catch (error) {
          console.error("Failed to fetch health tip:", error);
          setHealthTip("Could not load a tip right now, but remember that caring for plants is a great way to de-stress!");
        } finally {
          setIsLoadingTip(false);
        }
      } else {
        setHealthTip("Caring for plants can be a wonderful and relaxing hobby. Enjoy your garden!");
        setIsLoadingTip(false);
      }
    };
    fetchTip();
  }, [user.medicalCondition]);

  const upcomingReminder = reminders[0] || null;

  return (
    <div className="space-y-6">
      <div className="px-4">
        <p className="text-lg text-brand-brown">Welcome Back,</p>
        <h2 className="text-3xl font-bold text-brand-green font-serif -mt-1">
          {user.username}!
        </h2>
      </div>
      
      <div className="bg-gradient-to-r from-brand-green to-brand-light-green text-white p-5 rounded-2xl shadow-lg mx-4">
        <h3 className="text-md font-bold mb-2 opacity-90">A Tip For You</h3>
        <div className="min-h-[40px] flex items-center">
          {isLoadingTip ? <Spinner /> : <p className="text-sm font-light">{healthTip}</p>}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-md mx-4">
        <h3 className="text-lg font-semibold text-brand-brown mb-4 px-2">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-white">
            <QuickActionButton icon={<GardenIcon />} label="My Garden" onClick={() => setActiveView('myGarden')} color="bg-green-400" />
            <QuickActionButton icon={<RecommendIcon />} label="For You" onClick={() => setActiveView('recommendations')} color="bg-pink-400" />
            <QuickActionButton icon={<ReminderIcon />} label="Reminders" onClick={() => setActiveView('reminders')} color="bg-blue-400" />
            <QuickActionButton icon={<WarningIcon />} label="Warnings" onClick={() => setActiveView('warnings')} color="bg-red-500" />
            <QuickActionButton icon={<BookIcon />} label="Discover" onClick={() => setActiveView('encyclopedia')} color="bg-yellow-500" />
        </div>
      </div>
      
      <div className="px-4">
        <h3 className="text-lg font-semibold text-brand-brown mb-3">Upcoming Reminder</h3>
        {upcomingReminder ? (
          <div onClick={() => setActiveView('reminders')} className="bg-white p-4 rounded-2xl shadow-md flex items-center space-x-4 cursor-pointer">
              <div className="bg-brand-light-green/20 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="font-semibold text-brand-brown truncate">{upcomingReminder.message}</p>
                <p className="text-sm text-gray-500">{upcomingReminder.plantName} &bull; {upcomingReminder.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
          </div>
        ) : (
          <div onClick={() => setActiveView('reminders')} className="bg-white text-center p-6 rounded-2xl shadow-md text-gray-500 cursor-pointer">
            <p>No upcoming reminders. Tap to add one!</p>
          </div>
        )}
      </div>

      <div className="px-4">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-brand-brown">My Garden</h3>
            <button onClick={() => setActiveView('myGarden')} className="text-sm font-semibold text-brand-green">View All</button>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-md">
            {myPlants.length > 0 ? (
                <div className="flex items-center space-x-4">
                    <div className="flex -space-x-4">
                        {myPlants.slice(0, 4).map(plant => (
                            <img key={plant.id} src={plant.imageUrl} alt={plant.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"/>
                        ))}
                    </div>
                    <p className="text-brand-brown flex-1">You have {myPlants.length} plant(s) thriving!</p>
                </div>
            ) : (
                <p className="text-center text-gray-500 py-4">Your garden is waiting. Add your first plant!</p>
            )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
