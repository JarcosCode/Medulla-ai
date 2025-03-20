import dotenv from 'dotenv';
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('Environment variables loaded:', {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Present' : 'Missing',
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY ? 'Present' : 'Missing',
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ? 'Present' : 'Missing',
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ? 'Present' : 'Missing',
  DATABASE_URL: process.env.DATABASE_URL ? 'Present' : 'Missing'
});

import { getMusicRecommendations } from './server/openai';

async function testRecommendations() {
  try {
    console.log('Testing song recommendations...');
    const songResult = await getMusicRecommendations(
      'I like upbeat electronic music with strong beats and melodic vocals',
      'songs'
    );
    console.log('Song recommendations:', JSON.stringify(songResult, null, 2));

    console.log('\nTesting playlist recommendations...');
    const playlistResult = await getMusicRecommendations(
      'I need a workout playlist with high energy electronic and hip hop',
      'playlists'
    );
    console.log('Playlist recommendations:', JSON.stringify(playlistResult, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRecommendations(); 