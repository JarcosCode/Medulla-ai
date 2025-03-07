import OpenAI from "openai";
import { searchYouTube } from "./youtube";
import { searchSpotify } from "./spotify";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
export async function getMusicRecommendations(preferences: string, type: 'songs' | 'playlists'): Promise<{
  recommendations: Array<{
    name: string;
    artist?: string;
    description?: string;
    genres?: string[];
    mood?: string;
    confidence_score?: number;
    youtubeUrl?: string;
    spotifyUrl?: string;
  }>;
}> {
  try {
    const systemPrompt = type === 'songs' 
      ? `You are an expert music recommendation AI with deep knowledge of music genres, artists, and emotional resonance. Analyze the user's preferences and provide highly personalized song recommendations.

         For each song, include:
         - Song name (required)
         - Artist name (required)
         - A brief description explaining why this song matches their preferences (required)
         - Primary genres (required, array of genres)
         - Mood/emotional tone (required)
         - Confidence score (0-1) indicating how well this matches their preferences

         Consider these factors:
         - Musical elements (tempo, instruments, vocal style)
         - Lyrical themes and content
         - Artist's style and influence
         - Cultural and historical context
         - Emotional resonance

         Important: Do not include any URLs, they will be added later.
         Focus on providing accurate and contextual recommendations.

         Respond with JSON in this format: 
         { "recommendations": [{ 
           "name": string, 
           "artist": string, 
           "description": string,
           "genres": string[],
           "mood": string,
           "confidence_score": number
         }] }`
      : `You are an expert music curator with deep knowledge of playlist creation and music organization. Create themed playlists based on the user's preferences.

         For each playlist suggestion, include:
         - Playlist name (required)
         - A detailed description of the playlist theme and mood (required)
         - Primary genres included (required, array of genres)
         - Mood/emotional journey (required)
         - Confidence score (0-1) indicating how well this matches their preferences

         Consider these factors:
         - Genre cohesion and progression
         - Emotional journey and flow
         - Activity or context suitability
         - Cultural and temporal relevance

         Important: Do not include any URLs, they will be added later.
         Focus on creating cohesive and meaningful playlist concepts.

         Respond with JSON in this format: 
         { "recommendations": [{ 
           "name": string, 
           "description": string,
           "genres": string[],
           "mood": string,
           "confidence_score": number
         }] }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: preferences
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Add real YouTube and Spotify URLs to the recommendations
    const recommendationsWithLinks = await Promise.all(
      result.recommendations.map(async (rec) => {
        const searchQuery = type === 'songs' 
          ? `${rec.name} ${rec.artist}`
          : rec.name;

        const [youtubeResult, spotifyResult] = await Promise.all([
          searchYouTube(
            type === 'songs' ? `${searchQuery} official music video` : `${searchQuery} music playlist`,
            type === 'songs' ? 'video' : 'playlist'
          ),
          searchSpotify(searchQuery, type === 'songs' ? 'track' : 'playlist')
        ]);

        return {
          ...rec,
          youtubeUrl: youtubeResult?.url,
          spotifyUrl: spotifyResult?.url
        };
      })
    );

    console.log('Enhanced recommendations:', { recommendations: recommendationsWithLinks });
    return { recommendations: recommendationsWithLinks };
  } catch (error) {
    throw new Error(`Failed to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}