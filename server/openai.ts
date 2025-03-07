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
         - Links to music platforms (IMPORTANT: include at least YouTube links):
           * YouTube: "https://www.youtube.com/watch?v={video_id}" for official music video
           * Spotify: "https://open.spotify.com/track/{track_id}" for the song
           * Apple Music: "https://music.apple.com/album/{album_id}/song/{song_id}" for the song

         Note: ALWAYS include YouTube links for songs. For Spotify and Apple Music, include if available.

         Respond with JSON in this format: 
         { "recommendations": [{ 
           "name": string, 
           "artist": string, 
           "description": string,
           "youtubeUrl": string,
           "spotifyUrl"?: string,
           "appleMusicUrl"?: string
         }] }`
      : `You are a music recommendation expert. Suggest themed playlists based on the user's preferences.
         For each playlist suggestion, include:
         - Playlist name (required)
         - A description of the playlist theme and mood (required)
         - Links to playlists (IMPORTANT: include at least YouTube links):
           * YouTube: "https://www.youtube.com/playlist?list={playlist_id}" for existing playlists
           * Spotify: "https://open.spotify.com/playlist/{playlist_id}" for existing playlists
           * Apple Music: "https://music.apple.com/playlist/{playlist_id}" for existing playlists

         Note: ALWAYS include YouTube playlist links. For Spotify and Apple Music, include if available.

         Respond with JSON in this format: 
         { "recommendations": [{ 
           "name": string, 
           "description": string,
           "youtubeUrl": string,
           "spotifyUrl"?: string,
           "appleMusicUrl"?: string
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
    console.log('OpenAI Response:', result);
    return result;
  } catch (error) {
    throw new Error(`Failed to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}