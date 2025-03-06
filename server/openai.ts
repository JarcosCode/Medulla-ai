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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a music recommendation expert. Based on the user's preferences, suggest ${type === 'songs' ? 'individual songs' : 'playlists'}. Respond with JSON in this format: { "recommendations": [{ "name": string, "artist": string, "description": string, "youtubeUrl": string, "spotifyUrl": string, "appleMusicUrl": string }] }`
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
    throw new Error(`Failed to get recommendations: ${error.message}`);
  }
}
