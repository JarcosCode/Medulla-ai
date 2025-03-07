import { z } from "zod";

const youtubeVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  channelTitle: z.string(),
  url: z.string(),
});

type YouTubeVideo = z.infer<typeof youtubeVideoSchema>;

const CATEGORY_IDS = {
  "Hip-Hop": "10",
  "Pop": "10",
  "Rock": "10",
};

export async function getTrendingVideos(): Promise<Record<string, YouTubeVideo>> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const results: Record<string, YouTubeVideo> = {};

  for (const [category, categoryId] of Object.entries(CATEGORY_IDS)) {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=${categoryId}&maxResults=1&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();
    const video = data.items[0];

    if (video) {
      results[category] = {
        id: video.id,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        url: `https://youtube.com/watch?v=${video.id}`,
      };
    }
  }

  return results;
}
