import { z } from "zod";

const youtubeVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  channelTitle: z.string(),
  url: z.string(),
});

type YouTubeVideo = z.infer<typeof youtubeVideoSchema>;

async function searchYouTube(query: string, type: 'video' | 'playlist'): Promise<{
  id: string;
  title: string;
  channelTitle: string;
  url: string;
} | null> {
  const API_KEY = process.env.YOUTUBE_API_KEY;

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=${type}&maxResults=1&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const item = data.items[0];
    const videoId = type === 'video' ? item.id.videoId : item.id.playlistId;

    return {
      id: videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      url: type === 'video'
        ? `https://youtube.com/watch?v=${videoId}`
        : `https://youtube.com/playlist?list=${videoId}`,
    };
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return null;
  }
}

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

export { searchYouTube };