import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

interface Recommendation {
  name: string;
  artist?: string;
  description?: string;
  genres?: string[];
  mood?: string;
  confidence_score?: number;
  youtubeUrl?: string;
  spotifyUrl?: string;
}

const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: { preferences: string; type: 'songs' | 'playlists' }) => {
      console.log('Sending recommendation request:', {
        url: '/api/recommendations',
        data,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      try {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('Response data:', responseData);
        return responseData;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Recommendations received:', data);
      setRecommendations(data.recommendations);
      setShowResults(true);
    },
    onError: (error: Error) => {
      console.error('Error getting recommendations:', error);
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const preferences = formData.get('preferences') as string;
    const type = formData.get('type') as 'songs' | 'playlists';

    if (!preferences || !type) {
      setError('Please fill in all fields');
      return;
    }

    mutation.mutate({ preferences, type });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="preferences" className="block text-sm font-medium text-gray-700">
            What kind of music do you like?
          </label>
          <textarea
            id="preferences"
            name="preferences"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Describe your music preferences, favorite artists, genres, or mood..."
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            What would you like?
          </label>
          <select
            id="type"
            name="type"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="songs">Individual Songs</option>
            <option value="playlists">Playlists</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {mutation.isPending ? 'Getting Recommendations...' : 'Get Recommendations'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {showResults && recommendations.length > 0 && (
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Recommendations</h2>
          <div className="grid gap-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900">{rec.name}</h3>
                {rec.artist && (
                  <p className="text-gray-600">by {rec.artist}</p>
                )}
                {rec.description && (
                  <p className="mt-2 text-gray-700">{rec.description}</p>
                )}
                {rec.genres && rec.genres.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rec.genres.map((genre, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
                {rec.mood && (
                  <p className="mt-2 text-sm text-gray-500">Mood: {rec.mood}</p>
                )}
                <div className="mt-4 flex gap-4">
                  {rec.youtubeUrl && (
                    <a
                      href={rec.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Listen on YouTube
                    </a>
                  )}
                  {rec.spotifyUrl && (
                    <a
                      href={rec.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Listen on Spotify
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations; 