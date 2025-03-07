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
  const results: Record<string, YouTubeVideo> = {};

  const genres = ["Hip-Hop", "Pop", "Rock"];

  for (const genre of genres) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${genre}+music&type=video&videoCategoryId=10&maxResults=1&order=viewCount&key=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = await response.json();
      const video = data.items[0];

      if (video) {
        results[genre] = {
          id: video.id.videoId,
          title: video.snippet.title,
          channelTitle: video.snippet.channelTitle,
          url: `https://youtube.com/watch?v=${video.id.videoId}`,
        };
      }
    } catch (error) {
      console.error(`Error fetching ${genre} videos:`, error);
    }
  }

  return results;
}