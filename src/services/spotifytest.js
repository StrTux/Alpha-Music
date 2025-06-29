import fetch from 'node-fetch';
import 'dotenv/config';
import { getSpotifyToken } from './getSpotifyToken.js';

export async function testSpotifyPlaylistSearch() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const token = await getSpotifyToken(clientId, clientSecret);

  const query = 'arjit singh';
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=5`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  const playlists = (data.playlists?.items || []).filter(Boolean);

  console.log(`\n🎧 Found ${playlists.length} playlists for "${query}":\n`);

  playlists.forEach((playlist, index) => {
    console.log(`#${index + 1}`);
    console.log(`🎵 Name     : ${playlist.name}`);
    console.log(`👤 Owner    : ${playlist.owner?.display_name}`);
    console.log(`🆔 ID       : ${playlist.id}`);
    console.log(`🔗 URL      : ${playlist.external_urls?.spotify}`);
    console.log(`🖼️ Image    : ${playlist.images?.[0]?.url || 'No image'}`);
    console.log('---------------------------');
  });
}

// Run the test
testSpotifyPlaylistSearch();
