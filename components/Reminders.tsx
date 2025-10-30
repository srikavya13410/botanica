import React, { useState, useEffect, useRef } from 'react';
import { Reminder, Plant } from '../types';

interface RemindersProps {
  myPlants: Plant[];
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'timeoutId'>) => void;
  deleteReminder: (id: string) => void;
}

const Reminders: React.FC<RemindersProps> = ({ myPlants, reminders, addReminder, deleteReminder }) => {
  const [message, setMessage] = useState('');
  const [time, setTime] = useState('');
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const timeoutIdsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const currentTimeoutIds = timeoutIdsRef.current;
    
    // Clear all existing timeouts to prevent duplicates
    currentTimeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
    const newTimeoutIds = new Map<string, number>();

    // Schedule new notifications for all reminders from props
    reminders.forEach(reminder => {
      const reminderTime = new Date(reminder.time);
      const now = new Date();
      const timeDiff = reminderTime.getTime() - now.getTime();

      if (timeDiff > 0) {
        const timeoutId = window.setTimeout(() => {
          alert(`Reminder for ${reminder.plantName || 'General'}: ${reminder.message}`);
          deleteReminder(reminder.id); // Automatically remove the reminder after it fires
        }, timeDiff);
        newTimeoutIds.set(reminder.id, timeoutId);
      }
    });

    timeoutIdsRef.current = newTimeoutIds;

    // Cleanup function to clear all timeouts when the component unmounts
    return () => {
      timeoutIdsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, [reminders, deleteReminder]);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !time) return;

    const reminderTime = new Date(time);
    if (reminderTime <= new Date()) {
      alert("Please select a future time for the reminder.");
      return;
    }

    const selectedPlant = myPlants.find(p => p.id === selectedPlantId);
    
    addReminder({
      message,
      time: reminderTime,
      plantId: selectedPlantId,
      plantName: selectedPlant ? (selectedPlant.nickname ? `${selectedPlant.nickname} (${selectedPlant.name})` : selectedPlant.name) : 'General Note',
    });

    setMessage('');
    setTime('');
    setSelectedPlantId('');
  };

  const handleDeleteReminder = (id: string) => {
    deleteReminder(id);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-3xl font-bold text-brand-brown mb-4">Reminders & Notes</h2>
      
      <form onSubmit={handleAddReminder} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold text-brand-green">New Reminder</h3>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-brand-brown">Message</label>
          <input
            id="message"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light-green"
            placeholder="e.g., Water the roses"
            required
          />
        </div>
        <div>
          <label htmlFor="plant" className="block text-sm font-medium text-brand-brown">For Plant (optional)</label>
          <select
            id="plant"
            value={selectedPlantId}
            onChange={(e) => setSelectedPlantId(e.target.value)}
            className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light-green bg-white"
          >
            <option value="">General Note</option>
            {myPlants.map(plant => (
              <option key={plant.id} value={plant.id}>
                {plant.nickname ? `${plant.nickname} (${plant.name})` : plant.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-brand-brown">Time</label>
          <input
            id="time"
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light-green"
            required
          />
        </div>
        <button type="submit" className="w-full bg-brand-green text-white py-2 rounded-lg hover:bg-brand-light-green transition-colors">Set Reminder</button>
      </form>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-brand-green">Upcoming Reminders</h3>
        {reminders.length > 0 ? (
          reminders.map(reminder => (
            <div key={reminder.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
              <div>
                <p className="font-semibold text-brand-brown">{reminder.message}</p>
                <p className="text-xs text-brand-green">{reminder.plantName}</p>
                <p className="text-sm text-gray-500">{reminder.time.toLocaleString()}</p>
              </div>
              <button onClick={() => handleDeleteReminder(reminder.id)} className="text-red-500 hover:text-red-700" aria-label={`Delete reminder: ${reminder.message}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-10">No reminders set.</p>
        )}
      </div>
    </div>
  );
};

export default Reminders;