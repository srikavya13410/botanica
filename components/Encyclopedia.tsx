
import React, { useState, useEffect } from 'react';
import * as geminiService from '../services/geminiService';
import Spinner from './common/Spinner';

interface EncyclopediaProps {
    initialQuery?: string;
    clearInitialQuery?: () => void;
}

interface SearchResult {
    description: string;
    imagePrompt: string;
}

const Encyclopedia: React.FC<EncyclopediaProps> = ({ initialQuery, clearInitialQuery }) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setImageUrl(null);
    try {
      const info: SearchResult = await geminiService.getEncyclopediaInfo(searchQuery);
      setResult(info);
      setIsLoading(false); // Stop main loading
      
      // Start image loading
      setIsLoadingImage(true);
      const imageGenPrompt = `A vibrant, clear photograph representing: ${info.imagePrompt}. Studio lighting, on a pure white background.`;
      const generatedUrl = await geminiService.generatePlantImage(imageGenPrompt);
      setImageUrl(generatedUrl);

    } catch (err) {
      setError('Could not fetch information. Please try again.');
      console.error(err);
      setIsLoading(false);
    } finally {
      setIsLoadingImage(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
        setQuery(initialQuery);
        executeSearch(initialQuery);
        clearInitialQuery?.();
    }
  }, [initialQuery, clearInitialQuery]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };
  
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-brand-green">{line.substring(4)}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold mt-6 mb-3 text-brand-green">{line.substring(3)}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mt-8 mb-4 text-brand-green">{line.substring(2)}</h1>;
      }
      if (line.startsWith('* ')) {
        return <li key={index} className="ml-6 list-disc">{line.substring(2)}</li>;
      }
      return <p key={index} className="my-2 text-brand-brown">{line}</p>;
    });
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-3xl font-bold text-brand-brown">Botanical Encyclopedia</h2>
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'Rose stem' or 'Photosynthesis'"
          className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light-green"
        />
        <button type="submit" disabled={isLoading} className="bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-light-green transition-colors disabled:bg-gray-400">
          {isLoading ? '...' : 'Search'}
        </button>
      </form>

      <div className="bg-white p-6 rounded-lg shadow-md min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
        ) : result ? (
          <div className="prose max-w-none animate-fade-in">
            <div className="relative w-full h-56 bg-gray-100 rounded-lg mb-6">
                {isLoadingImage ? (
                    <div className="absolute inset-0 flex items-center justify-center"><Spinner /></div>
                ) : (
                    imageUrl && <img src={imageUrl} alt={query} className="w-full h-full object-cover rounded-lg" />
                )}
            </div>
            {renderMarkdown(result.description)}
          </div>
        ) : (
          <p className="text-center text-gray-500">Search for a plant or botanical term to learn more.</p>
        )}
      </div>
    </div>
  );
};

export default Encyclopedia;