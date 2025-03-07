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
      ? `You are a music recommendation expert. Suggest individual songs based on the user's preferences. Each song should include artist name and links to music platforms. Respond with JSON in this format: { "recommendations": [{ "name": string, "artist": string, "description": string, "youtubeUrl": string, "spotifyUrl": string, "appleMusicUrl": string }] }`
      : `You are a music recommendation expert. Suggest themed playlists based on the user's preferences. Each playlist should have a descriptive name and theme. Respond with JSON in this format: { "recommendations": [{ "name": string, "description": string, "youtubeUrl": string, "spotifyUrl": string, "appleMusicUrl": string }] }`;

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
    throw new Error(`Failed to get recommendations: ${error.message}`);
  }
}