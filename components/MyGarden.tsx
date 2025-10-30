import React, { useState, useRef } from 'react';
import { Plant } from '../types';
import * as geminiService from '../services/geminiService';
import PlantCard from './common/PlantCard';
import Spinner from './common/Spinner';

interface MyGardenProps {
  myPlants: Plant[];
  addPlantToGarden: (plant: Plant) => void;
  onLearnMore: (plantName: string) => void;
}

const exampleRose: Plant = {
  id: 'example-rose',
  name: 'Hybrid Tea Rose',
  nickname: 'My First Rose (Example)',
  lifeSpan: 'Perennial (many years)',
  seasonalInfo: 'Blooms from spring to fall.',
  usefulInfo: 'Cultivated for its beauty and fragrance. Be mindful of thorns when handling.',
  environment: 'Requires at least 6 hours of direct sunlight per day and well-draining soil.',
  wateringFrequency: 'Water deeply 1-2 times a week, more in hot weather.',
  imageUrl: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=1987&auto=format&fit=crop',
};


const MyGarden: React.FC<MyGardenProps> = ({ myPlants, addPlantToGarden, onLearnMore }) => {
  const [identifiedPlant, setIdentifiedPlant] = useState<Plant | null>(null);
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addMethod, setAddMethod] = useState<'photo' | 'name' | null>(null);
  const [plantNameQuery, setPlantNameQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setIdentifiedPlant(null);
    setNickname('');
    setError(null);
    setIsLoading(false);
    setPlantNameQuery('');
    // Don't reset addMethod, so the input form stays visible
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      resetState();
      setIsLoading(true);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
          const plantData = await geminiService.identifyPlant(base64String);
          setIdentifiedPlant({ ...plantData, id: Date.now().toString(), imageUrl: reader.result as string });
        } catch (err) {
          setError('Could not identify the plant. Please try another image.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearchByName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantNameQuery) return;
    resetState();
    setIsLoading(true);

    try {
        const plantData = await geminiService.getPlantInfoByName(plantNameQuery);
        // Plant data has an imagePrompt, but not an imageUrl. We need to generate it.
        const tempPlant = {
            ...plantData,
            id: Date.now().toString(),
            imageUrl: '',
            isLoadingImage: true,
        };
        setIdentifiedPlant(tempPlant);
        setIsLoading(false); // Main loading is done, now card will load image

        const imageGenPrompt = `A vibrant, clear photograph of a healthy ${plantData.imagePrompt || plantData.name}, in a simple pot, studio lighting, on a pure white background.`;
        const imageUrl = await geminiService.generatePlantImage(imageGenPrompt);
        setIdentifiedPlant(prev => prev ? { ...prev, imageUrl, isLoadingImage: false } : null);

    } catch (err) {
        setError(`Could not find information for "${plantNameQuery}". Please check the spelling.`);
        console.error(err);
        setIsLoading(false);
    }
  };
  
  const handleConfirmAddPlant = () => {
    if (identifiedPlant) {
      addPlantToGarden({ ...identifiedPlant, nickname: nickname.trim() });
      resetState();
      setAddMethod(null);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="p-4 space-y-6">
       <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-xl font-semibold text-brand-green mb-4">Add a New Plant</h3>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => { setAddMethod('photo'); resetState(); triggerFileInput(); }} className="bg-brand-green text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-brand-light-green transition-all duration-300 transform hover:scale-105">Identify from Photo</button>
            <button onClick={() => { setAddMethod('name'); resetState(); }} className="bg-brand-brown text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105">Add by Name</button>
        </div>
      </div>
      
      <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" aria-label="Upload plant image" />

      {addMethod === 'name' && !identifiedPlant && (
        <form onSubmit={handleSearchByName} className="bg-white p-4 rounded-lg shadow-md animate-fade-in flex gap-2">
            <input type="text" value={plantNameQuery} onChange={e => setPlantNameQuery(e.target.value)} placeholder="Enter plant name, e.g., 'Monstera Deliciosa'" className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light-green" />
            <button type="submit" disabled={isLoading} className="bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-light-green transition-colors disabled:bg-gray-400">
                {isLoading ? '...' : 'Find'}
            </button>
        </form>
      )}

      {isLoading && <div className="flex justify-center pt-4"><Spinner /></div>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      
      {identifiedPlant && (
        <div className="bg-brand-light-green/20 p-4 rounded-lg animate-fade-in">
          <h2 className="text-2xl font-bold text-brand-green mb-4 text-center">Found a plant! Is this it?</h2>
          <PlantCard plant={identifiedPlant} />
          <div className="p-4 bg-white rounded-b-lg shadow-lg -mt-4">
            <label htmlFor="nickname" className="block text-sm font-medium text-brand-brown">Give it a nickname (optional)</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light-green"
              placeholder="e.g., Spiky, Sunny"
            />
            <button
              onClick={handleConfirmAddPlant}
              className="w-full mt-4 bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-light-green transition-colors"
            >
              Add to My Garden
            </button>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold text-brand-brown mb-4">Your Garden</h2>
        {myPlants.length > 0 ? (
          <div className="space-y-8">
            {myPlants.map(plant => (
              <PlantCard key={plant.id} plant={plant} onLearnMore={onLearnMore} displayMode="list" />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10 px-4 bg-gray-50 rounded-lg">
            <p className="mb-4">Your garden is empty. Here's an example of how your plants will look!</p>
            <div className="text-left w-full max-w-4xl mx-auto">
                 <PlantCard plant={exampleRose} onLearnMore={onLearnMore} displayMode="list" />
            </div>
            <p className="mt-6 font-semibold">Click the photo above to see it in full screen.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGarden;