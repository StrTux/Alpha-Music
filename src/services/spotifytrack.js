import { SPOTIFY_CONFIG } from '../config/spotifyConfig';

async function getAllSpotifyTracks(playlistId) {
  const clientId = SPOTIFY_CONFIG.CLIENT_ID;
  const clientSecret = SPOTIFY_CONFIG.CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.warn('Spotify credentials not configured. Skipping playlist fetch.');
    return [];
  }
  
  // Get token using the existing getSpotifyToken function
  const { getSpotifyToken } = require('./getSpotifyToken');
  const token = await getSpotifyToken(clientId, clientSecret);

  let allTracks = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      break;
    }

    const tracks = data.items
      .filter(item => item.track)
      .map(item => ({
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists.map(artist => artist.name).join(', '),
        album: item.track.album.name,
        duration: item.track.duration_ms,
        image: item.track.album.images[0]?.url,
      }));

    allTracks = allTracks.concat(tracks);
    offset += limit;

    if (data.items.length < limit) {
      break;
    }
  }

  console.log(`\n🎶 Found ${allTracks.length} songs in playlist "${playlistId}":\n`);

  allTracks.forEach((item, index) => {
    console.log(`#${index + 1} 🎵 ${item.name} - 👤 ${item.artists}`);
  });

  return allTracks;
}

export { getAllSpotifyTracks };
