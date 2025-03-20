import OpenAI from "openai";
import { searchYouTube } from "./youtube";
import { searchSpotify } from "./spotify";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
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

export async function getMusicRecommendations(preferences: string, type: 'songs' | 'playlists'): Promise<{
  recommendations: Recommendation[];
}> {
  try {
    console.log("Initializing OpenAI client with API key:", process.env.OPENAI_API_KEY ? "Present" : "Missing");
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing");
      throw new Error("OpenAI API key is not configured");
    }

    console.log("Creating chat completion with preferences:", preferences);
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.8,
      top_p: 0.9,
      presence_penalty: 0.3,
      frequency_penalty: 0.5,
      messages: [
        {
          role: "system",
          content: type === 'songs' 
            ? `You are an expert music recommendation AI with deep knowledge of music genres, artists, and emotional resonance. Analyze the user's preferences and provide highly personalized song recommendations. Each recommendation should be unique and creative, drawing from a diverse range of genres and artists.

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
               }] }`
        },
        {
          role: "user",
          content: preferences
        }
      ]
    });

    console.log("Received OpenAI response:", response.choices[0].message);
    const content = response.choices[0].message.content;
    if (!content) {
      console.error("No content in OpenAI response");
      throw new Error("No content in OpenAI response");
    }

    let result;
    try {
      result = JSON.parse(content);
      console.log("Parsed OpenAI response:", result);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Invalid JSON response from OpenAI");
    }

    if (!result.recommendations || !Array.isArray(result.recommendations)) {
      console.error("Invalid response format:", result);
      throw new Error("Invalid response format from OpenAI");
    }

    console.log("Adding YouTube and Spotify links...");
    // Add real YouTube and Spotify URLs to the recommendations
    const recommendationsWithLinks = await Promise.all(
      result.recommendations.map(async (rec: Recommendation) => {
        const searchQuery = type === 'songs' 
          ? `${rec.name} ${rec.artist || ''}`
          : rec.name;

        try {
          const [youtubeResult, spotifyResult] = await Promise.all([
            searchYouTube(
              type === 'songs' ? `${searchQuery} official music video` : `${searchQuery} music playlist`,
              type === 'songs' ? 'video' : 'playlist'
            ),
            searchSpotify(searchQuery, type === 'songs' ? 'track' : 'playlist')
          ]);

          return {
            ...rec,
            youtubeUrl: youtubeResult?.url || undefined,
            spotifyUrl: spotifyResult?.url || undefined
          };
        } catch (error) {
          console.error(`Error adding links for ${searchQuery}:`, error);
          return rec; // Return recommendation without links if there's an error
        }
      })
    );

    console.log('Final enhanced recommendations:', { recommendations: recommendationsWithLinks });
    return { recommendations: recommendationsWithLinks };
  } catch (error) {
    console.error("Error in getMusicRecommendations:", {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}