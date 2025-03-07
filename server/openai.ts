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
         - Song name
         - Artist name
         - A brief description
         - YouTube URL in format: https://www.youtube.com/watch?v={video_id} (use real video IDs)
         - Spotify URL in format: https://open.spotify.com/track/{track_id}
         - Apple Music URL in format: https://music.apple.com/us/album/{album_name}/{track_name}/{id}

         Respond with JSON in this format: { "recommendations": [{ "name": string, "artist": string, "description": string, "youtubeUrl": string, "spotifyUrl": string, "appleMusicUrl": string }] }

         Important: Only include URLs if you are certain they are valid and working links.`
      : `You are a music recommendation expert. Suggest themed playlists based on the user's preferences.
         For each playlist, include:
         - Playlist name
         - A description of the playlist theme and mood
         - YouTube URL in format: https://www.youtube.com/playlist?list={playlist_id} (use real playlist IDs)
         - Spotify URL in format: https://open.spotify.com/playlist/{playlist_id}
         - Apple Music URL in format: https://music.apple.com/us/playlist/{playlist_name}/{id}

         Respond with JSON in this format: { "recommendations": [{ "name": string, "description": string, "youtubeUrl": string, "spotifyUrl": string, "appleMusicUrl": string }] }

         Important: Only include URLs if you are certain they are valid and working links.`;

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