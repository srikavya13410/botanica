import React, { useState } from 'react';
import { Plant } from '../../types';
import Spinner from './Spinner';
import ImageModal from './ImageModal';

interface PlantCardProps {
  plant: Plant;
  onAdd?: (plant: Plant) => void;
  showAddButton?: boolean;
  onLearnMore?: (plantName: string) => void;
  isAdded?: boolean;
  displayMode?: 'grid' | 'list';
}

const PlantCard: React.FC<PlantCardProps> = ({ plant, onAdd, showAddButton = false, onLearnMore, isAdded = false, displayMode = 'grid' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="mt-2">
      <p className="font-semibold text-brand-brown text-sm">{label}</p>
      <p className="text-gray-700 text-sm">{value}</p>
    </div>
  );

  if (displayMode === 'list') {
    return (
      <>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col">
          <div className="relative w-full h-80 bg-gray-100">
            {plant.isLoadingImage ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner />
              </div>
            ) : (
              plant.imageUrl && <img src={plant.imageUrl} alt={plant.name} className="w-full h-full object-cover cursor-pointer" onClick={() => setIsModalOpen(true)} />
            )}
          </div>
          <div className="p-6 flex flex-col">
            {plant.nickname ? (
                <>
                    <h3 className="text-2xl font-bold text-brand-green">{plant.nickname}</h3>
                    <p className="text-lg text-gray-600 -mt-1">{plant.name}</p>
                </>
            ) : (
                <h3 className="text-2xl font-bold text-brand-green">{plant.name}</h3>
            )}

            {typeof plant.isSafe !== 'undefined' && (
              <div className={`flex items-center gap-2 p-2 rounded-md my-3 ${plant.isSafe ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {plant.isSafe ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <p className="text-sm font-semibold">{plant.isSafe ? 'Verified Safe' : 'Caution Advised'}</p>
              </div>
            )}

            <div className="mt-4 space-y-2">
              {plant.safetyExplanation && (
                <div className="p-3 bg-yellow-100 border-l-4 border-brand-yellow rounded">
                    <p className="font-semibold text-yellow-800 text-sm">Safety Note</p>
                    <p className="text-yellow-700 text-sm">{plant.safetyExplanation}</p>
                </div>
              )}
              <InfoRow label="Life Span" value={plant.lifeSpan} />
              <InfoRow label="Seasonal Info" value={plant.seasonalInfo} />
              <InfoRow label="Environment" value={plant.environment} />
              <InfoRow label="Watering" value={plant.wateringFrequency} />
              <InfoRow label="Useful Info" value={plant.usefulInfo} />
            </div>
            
            <div className="mt-auto pt-4 flex justify-end items-center flex-wrap gap-2">
                {onLearnMore && (
                    <button
                        onClick={() => onLearnMore(plant.name)}
                        className="text-sm text-brand-brown font-semibold py-2 px-4 rounded-lg hover:bg-brand-light-green/20 transition-colors"
                    >
                        Learn More
                    </button>
                )}
            </div>
          </div>
        </div>
        {isModalOpen && plant.imageUrl && (
          <ImageModal imageUrl={plant.imageUrl} altText={`Full size view of ${plant.name}`} onClose={() => setIsModalOpen(false)} />
        )}
      </>
    );
  }

  // Default Grid View
  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <div className="relative w-full h-48 bg-gray-100">
          {plant.isLoadingImage ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </div>
          ) : (
            plant.imageUrl && <img src={plant.imageUrl} alt={plant.name} className="w-full h-full object-cover cursor-pointer" onClick={() => setIsModalOpen(true)} />
          )}
        </div>
        <div className="p-4">
          {plant.nickname ? (
              <>
                  <h3 className="text-xl font-bold text-brand-green">{plant.nickname}</h3>
                  <p className="text-md text-gray-600 -mt-1">{plant.name}</p>
              </>
          ) : (
              <h3 className="text-xl font-bold text-brand-green">{plant.name}</h3>
          )}

          {typeof plant.isSafe !== 'undefined' && (
            <div className={`flex items-center gap-2 p-2 rounded-md my-3 ${plant.isSafe ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {plant.isSafe ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <p className="text-sm font-semibold">{plant.isSafe ? 'Verified Safe' : 'Caution Advised'}</p>
            </div>
          )}

          {isExpanded && (
            <div className="mt-4 animate-fade-in">
              {plant.safetyExplanation && (
                <div className="mt-2 mb-4 p-3 bg-yellow-100 border-l-4 border-brand-yellow rounded">
                    <p className="font-semibold text-yellow-800 text-sm">Safety Note</p>
                    <p className="text-yellow-700 text-sm">{plant.safetyExplanation}</p>
                </div>
              )}
              <InfoRow label="Life Span" value={plant.lifeSpan} />
              <InfoRow label="Seasonal Info" value={plant.seasonalInfo} />
              <InfoRow label="Environment" value={plant.environment} />
              <InfoRow label="Watering" value={plant.wateringFrequency} />
              <InfoRow label="Useful Info" value={plant.usefulInfo} />
            </div>
          )}
          <div className="mt-4 flex justify-between items-center flex-wrap gap-2">
              <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-brand-green font-semibold py-2 px-4 rounded-lg hover:bg-brand-light-green/20 transition-colors"
              >
                  {isExpanded ? 'Show Less' : 'Details'}
              </button>
              {onLearnMore && (
                  <button
                      onClick={() => onLearnMore(plant.name)}
                      className="text-sm text-brand-brown font-semibold py-2 px-4 rounded-lg hover:bg-brand-light-green/20 transition-colors"
                  >
                      Learn More
                  </button>
              )}
              {showAddButton && onAdd && (
                  <button
                      onClick={() => !isAdded && onAdd(plant)}
                      className={`font-bold py-2 px-4 rounded-lg transition-colors ${
                          isAdded
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-brand-green text-white hover:bg-brand-light-green'
                      }`}
                      disabled={isAdded}
                  >
                  {isAdded ? 'Added ✓' : 'Add to Garden'}
                  </button>
              )}
          </div>
        </div>
      </div>
      {isModalOpen && plant.imageUrl && (
        <ImageModal imageUrl={plant.imageUrl} altText={`Full size view of ${plant.name}`} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default PlantCard;