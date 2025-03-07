const spotifyApiBaseUrl = 'https://api.spotify.com/v1';
const spotifyAccountsUrl = 'https://accounts.spotify.com/api/token';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch(spotifyAccountsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token');
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000);

  return accessToken;
}

export async function searchSpotify(query: string, type: 'track' | 'playlist'): Promise<{
  id: string;
  name: string;
  url: string;
} | null> {
  try {
    const token = await getAccessToken();
    const response = await fetch(
      `${spotifyApiBaseUrl}/search?q=${encodeURIComponent(query)}&type=${type}&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    const data = await response.json();
    const items = type === 'track' ? data.tracks.items : data.playlists.items;

    if (!items || items.length === 0) {
      return null;
    }

    const item = items[0];
    return {
      id: item.id,
      name: item.name,
      url: type === 'track' 
        ? `https://open.spotify.com/track/${item.id}`
        : `https://open.spotify.com/playlist/${item.id}`,
    };
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return null;
  }
}
