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
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&chart=mostPopular&videoCategoryId=10&maxResults=3&regionCode=US&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();
    const results: Record<string, YouTubeVideo> = {};

    // Map the videos to our categories, filtering out any private or deleted videos
    let validVideoCount = 0;
    for (const video of data.items) {
      // Skip private or deleted videos
      if (video.status?.privacyStatus !== "public") {
        continue;
      }

      const categories = ["Trending #1", "Trending #2", "Trending #3"];
      if (validVideoCount < categories.length) {
        results[categories[validVideoCount]] = {
          id: video.id,
          title: video.snippet.title,
          channelTitle: video.snippet.channelTitle,
          url: `https://youtube.com/watch?v=${video.id}`,
        };
        validVideoCount++;
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    return {};
  }
}