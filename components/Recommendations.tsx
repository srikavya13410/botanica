
import React, { useState, useCallback } from 'react';
import { User, Plant } from '../types';
import * as geminiService from '../services/geminiService';
import Spinner from './common/Spinner';
import PlantCard from './common/PlantCard';

interface RecommendationsProps {
  user: User;
  myPlants: Plant[];
  addPlantToGarden: (plant: Plant) => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({ user, myPlants, addPlantToGarden }) => {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState({ type: '', flowering: '', size: '' });
  const [recommendations, setRecommendations] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!preferences.type || !preferences.flowering || !preferences.size) return;
    setIsLoading(true);
    setError(null);
    try {
      const plantsData = await geminiService.getFilteredRecommendations(user.medicalCondition, preferences);
      
      const initialPlants = plantsData.map((p: any) => ({
        ...p,
        id: p.name + Date.now(),
        imageUrl: '',
        isLoadingImage: true,
      }));
      setRecommendations(initialPlants);
      setStep(2);

      // Asynchronously fetch real images
      initialPlants.forEach(async (plant, index) => {
        try {
          const imageGenPrompt = `A vibrant, clear photograph of a healthy ${plant.imagePrompt || plant.name}, in a simple pot, studio lighting, on a pure white background.`;
          const imageUrl = await geminiService.generatePlantImage(imageGenPrompt);
          setRecommendations(prev => {
            const newRecs = [...prev];
            if (newRecs[index]) {
                newRecs[index] = { ...newRecs[index], imageUrl, isLoadingImage: false };
            }
            return newRecs;
          });
        } catch (e) {
          console.error(`Failed to generate image for ${plant.name}`, e);
          setRecommendations(prev => {
            const newRecs = [...prev];
            if (newRecs[index]) {
                newRecs[index] = { ...newRecs[index], isLoadingImage: false };
            }
            return newRecs;
          });
        }
      });

    } catch (err) {
      setError('Could not fetch recommendations. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user.medicalCondition, preferences]);

  const handlePreferenceChange = (key: keyof typeof preferences, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleNextStep = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
       fetchRecommendations();
    }
  };

  const handleReset = () => {
      setStep(0);
      setPreferences({ type: '', flowering: '', size: '' });
      setRecommendations([]);
      setError(null);
  }

  const isPlantInGarden = (plantName: string) => {
    return myPlants.some(p => p.name.toLowerCase() === plantName.toLowerCase());
  };

  const renderStepContent = () => {
    if (isLoading && step < 2) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner />
          <p className="mt-4 text-brand-brown">Finding the perfect plants for you...</p>
        </div>
      );
    }
    
    if (error) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={handleReset} className="bg-brand-green text-white font-bold py-2 px-4 rounded-lg">Try Again</button>
            </div>
        )
    }

    switch (step) {
      case 0:
        return (
          <div className="text-center space-y-4 animate-fade-in">
            <h3 className="text-2xl font-semibold text-brand-green">Let's find plants that are right for you.</h3>
            <p className="text-brand-brown">Based on your condition, we'll guide you to safe and beneficial plants. First, choose a plant type.</p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {['Flower', 'Fruit', 'Leaf', 'Succulent', 'Herb'].map(type => (
                <button key={type} onClick={() => handlePreferenceChange('type', type)} className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all ${preferences.type === type ? 'bg-brand-green text-white shadow-lg' : 'bg-white text-brand-brown shadow-md hover:shadow-lg'}`}>{type}</button>
              ))}
            </div>
            {preferences.type && <button onClick={handleNextStep} className="mt-6 bg-brand-yellow text-brand-brown font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:opacity-90 transition-opacity">Next</button>}
          </div>
        );
      case 1:
        return (
          <div className="text-center space-y-4 animate-fade-in">
            <h3 className="text-2xl font-semibold text-brand-green">A few more details...</h3>
            <div className="space-y-6 pt-4">
              <div>
                <p className="text-brand-brown mb-2">Flowering or non-flowering?</p>
                <div className="flex justify-center gap-4">
                  {['Flowering', 'Non-flowering'].map(f => <button key={f} onClick={() => handlePreferenceChange('flowering', f)} className={`px-6 py-2 rounded-lg font-semibold ${preferences.flowering === f ? 'bg-brand-green text-white' : 'bg-white text-brand-brown'}`}>{f}</button>)}
                </div>
              </div>
              <div>
                <p className="text-brand-brown mb-2">What size are you looking for?</p>
                <div className="flex justify-center gap-4 flex-wrap">
                  {['Small (Desktop)', 'Medium (Floor)', 'Large (Outdoor)'].map(s => <button key={s} onClick={() => handlePreferenceChange('size', s)} className={`px-6 py-2 rounded-lg font-semibold ${preferences.size === s ? 'bg-brand-green text-white' : 'bg-white text-brand-brown'}`}>{s}</button>)}
                </div>
              </div>
            </div>
            {(preferences.flowering && preferences.size) && <button onClick={handleNextStep} className="mt-6 bg-brand-yellow text-brand-brown font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:opacity-90 transition-opacity">Find My Plants</button>}
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            <h3 className="text-2xl font-semibold text-brand-green text-center">Here are your recommendations!</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {recommendations.map(plant => 
                    <PlantCard 
                        key={plant.id} 
                        plant={plant} 
                        showAddButton={true}
                        onAdd={addPlantToGarden}
                        isAdded={isPlantInGarden(plant.name)}
                    />
                )}
            </div>
            <div className="text-center mt-8">
                <button onClick={handleReset} className="bg-brand-green text-white font-bold py-2 px-4 rounded-lg">Start Over</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-brand-brown mb-4">Plant Recommendations</h2>
      <div className="bg-brand-light-green/20 p-6 rounded-lg shadow-inner min-h-[400px]">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default Recommendations;