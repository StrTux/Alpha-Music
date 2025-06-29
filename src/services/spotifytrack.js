import fetch from 'node-fetch';
import 'dotenv/config';
import { getSpotifyToken } from './getSpotifyToken.js';

async function getAllSpotifyTracks(playlistId) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const token = await getSpotifyToken(clientId, clientSecret);

  let allTracks = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    const items = data.items?.filter(item => item.track) || [];

    allTracks.push(...items);

    if (items.length < limit) break;
    offset += limit;
  }

  console.log(`\n🎶 Found ${allTracks.length} songs in playlist "${playlistId}":\n`);

  allTracks.forEach((item, index) => {
    const track = item.track;
    console.log(`#${index + 1} 🎵 ${track.name} - 👤 ${track.artists.map(a => a.name).join(', ')}`);
  });

  return allTracks;
}

// Run with your playlist ID
getAllSpotifyTracks('41nDTubwCAj4ioLlSp6qU8');
