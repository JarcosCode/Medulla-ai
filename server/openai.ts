import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
export async function getMusicRecommendations(preferences: string, type: 'songs' | 'playlists'): Promise<{
  recommendations: Array<{
    name: string;
    artist?: string;
    description?: string;
    youtubeUrl?: string;
    spotifyUrl?: string;
    appleMusicUrl?: string;
  }>;
}> {
  try {
    const systemPrompt = type === 'songs' 
      ? `You are a music recommendation expert. Suggest individual songs based on the user's preferences. 
         For each song, include:
         - Song name (required)
         - Artist name (required)
         - A brief description (required)
         - Links (optional, only include if you're 100% certain they are real, working links):
           * For YouTube: only include if you can find the exact video ID for the official music video
           * For Spotify: only include if you can find the exact track ID
           * For Apple Music: only include if you can find the exact album/track IDs

         Note: It's better to omit links than to provide ones that might not work.
         Focus on providing accurate song and artist information first.

         Respond with JSON in this format: 
         { "recommendations": [{ 
           "name": string, 
           "artist": string, 
           "description": string,
           "youtubeUrl"?: string, // optional
           "spotifyUrl"?: string, // optional
           "appleMusicUrl"?: string // optional
         }] }`
      : `You are a music recommendation expert. Suggest themed playlists based on the user's preferences.
         For each playlist suggestion, include:
         - Playlist name (required)
         - A description of the playlist theme and mood (required)
         - Links (optional, only include if you're 100% certain they are real, working playlists):
           * For YouTube: only include if you can find an existing playlist ID
           * For Spotify: only include if you can find an existing playlist ID
           * For Apple Music: only include if you can find an existing playlist ID

         Note: It's better to omit links than to provide ones that might not work.
         Focus on providing good playlist suggestions with detailed descriptions.

         Respond with JSON in this format: 
         { "recommendations": [{ 
           "name": string, 
           "description": string,
           "youtubeUrl"?: string, // optional
           "spotifyUrl"?: string, // optional
           "appleMusicUrl"?: string // optional
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

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    throw new Error(`Failed to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}