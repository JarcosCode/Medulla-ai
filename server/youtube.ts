import { z } from "zod";

const youtubeVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  channelTitle: z.string(),
  url: z.string(),
});

type YouTubeVideo = z.infer<typeof youtubeVideoSchema>;

// Cache implementation
let trendingCache: {
  data: Record<string, YouTubeVideo>;
  lastUpdated: number;
} | null = null;

const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

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
  // Check if we have valid cached data
  if (trendingCache && (Date.now() - trendingCache.lastUpdated) < CACHE_DURATION) {
    console.log('Returning cached trending videos');
    return trendingCache.data;
  }

  const API_KEY = process.env.YOUTUBE_API_KEY;

  try {
    console.log('Fetching fresh trending videos from YouTube API');
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

    // Update cache
    trendingCache = {
      data: results,
      lastUpdated: Date.now()
    };

    return results;
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    // If there's an error and we have cached data, return it even if expired
    if (trendingCache) {
      console.log('Returning cached data due to API error');
      return trendingCache.data;
    }
    return {};
  }
}

export { searchYouTube };