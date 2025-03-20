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
  console.log('Searching YouTube with API key:', API_KEY ? 'Present' : 'Missing');

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=${type}&maxResults=1&key=${API_KEY}`;
    console.log('Making YouTube API request to:', url);
    
    const response = await fetch(url);
    console.log('YouTube API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error response:', errorText);
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('YouTube API response data:', JSON.stringify(data, null, 2));

    if (!data.items || data.items.length === 0) {
      console.log('No results found in YouTube API response');
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
  console.log('Fetching trending videos with API key:', API_KEY ? 'Present' : 'Missing');

  try {
    console.log('Fetching fresh trending videos from YouTube API');
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&chart=mostPopular&videoCategoryId=10&maxResults=3&regionCode=US&key=${API_KEY}`;
    console.log('Making YouTube API request to:', url);

    const response = await fetch(url);
    console.log('YouTube API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error response:', errorText);
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('YouTube API response data:', JSON.stringify(data, null, 2));

    const results: Record<string, YouTubeVideo> = {};

    // Map the videos to our categories, filtering out any private or deleted videos
    let validVideoCount = 0;
    for (const video of data.items) {
      // Skip private or deleted videos
      if (video.status?.privacyStatus !== "public") {
        console.log('Skipping private/deleted video:', video.id);
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

    console.log('Processed trending videos:', results);

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