import OpenAI from "openai";
import { searchYouTube } from "./youtube";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
export async function getMusicRecommendations(preferences: string, type: 'songs' | 'playlists'): Promise<{
  recommendations: Array<{
    name: string;
    artist?: string;
    description?: string;
    youtubeUrl?: string;
  }>;
}> {
  try {
    const systemPrompt = type === 'songs' 
      ? `You are a music recommendation expert. Suggest individual songs based on the user's preferences. 
         For each song, include:
         - Song name (required)
         - Artist name (required)
         - A brief description (required)

         Important: Do not include any URLs, they will be added later.
         Focus on providing accurate song and artist information.

         Respond with JSON in this format: 
         { "recommendations": [{ 
           "name": string, 
           "artist": string, 
           "description": string
         }] }`
      : `You are a music recommendation expert. Suggest themed playlists based on the user's preferences.
         For each playlist suggestion, include:
         - Playlist name (required)
         - A description of the playlist theme and mood (required)

         Important: Do not include any URLs, they will be added later.
         Focus on providing good playlist suggestions with detailed descriptions.

         Respond with JSON in this format: 
         { "recommendations": [{ 
           "name": string, 
           "description": string
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

    // Add real YouTube URLs to the recommendations
    const recommendationsWithLinks = await Promise.all(
      result.recommendations.map(async (rec) => {
        const searchQuery = type === 'songs' 
          ? `${rec.name} ${rec.artist} official music video`
          : `${rec.name} music playlist`;

        const youtubeResult = await searchYouTube(searchQuery, type === 'songs' ? 'video' : 'playlist');

        return {
          ...rec,
          youtubeUrl: youtubeResult?.url
        };
      })
    );

    console.log('Final recommendations:', { recommendations: recommendationsWithLinks });
    return { recommendations: recommendationsWithLinks };
  } catch (error) {
    throw new Error(`Failed to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}