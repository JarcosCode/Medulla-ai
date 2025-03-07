import { z } from "zod";

const youtubeVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  channelTitle: z.string(),
  url: z.string(),
});

type YouTubeVideo = z.infer<typeof youtubeVideoSchema>;

export async function getTrendingVideos(): Promise<Record<string, YouTubeVideo>> {
  const API_KEY = process.env.YOUTUBE_API_KEY;

  try {
    // Get trending music videos
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10&maxResults=3&regionCode=US&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();
    const results: Record<string, YouTubeVideo> = {};

    // Map the videos to our categories
    data.items.forEach((video: any, index: number) => {
      const categories = ["Trending #1", "Trending #2", "Trending #3"];
      results[categories[index]] = {
        id: video.id,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        url: `https://youtube.com/watch?v=${video.id}`,
      };
    });

    return results;
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    return {};
  }
}