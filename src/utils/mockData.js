/**
 * Mock data for when the API is not available
 */

export const mockTracks = [
  {
    id: '1',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: 'Divide',
    url: 'https://your-music-server.com/path/to/sample1.mp3',
    artwork:
      'https://c.saavncdn.com/092/shape-of-you-english-2017-20170106180334-500x500.jpg',
    duration: 240,
  },
  {
    id: '2',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    url: 'https://your-music-server.com/path/to/sample2.mp3',
    artwork:
      'https://c.saavncdn.com/433/Blinding-Lights-English-2019-20191129092758-500x500.jpg',
    duration: 210,
  },
  {
    id: '3',
    title: 'Bad Guy',
    artist: 'Billie Eilish',
    album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
    url: 'https://your-music-server.com/path/to/sample3.mp3',
    artwork:
      'https://c.saavncdn.com/947/WHEN-WE-ALL-FALL-ASLEEP-WHERE-DO-WE-GO-English-2019-20190329101955-500x500.jpg',
    duration: 180,
  },
  {
    id: '4',
    title: 'Dance Monkey',
    artist: 'Tones and I',
    album: 'The Kids Are Coming',
    url: 'https://your-music-server.com/path/to/sample4.mp3',
    artwork:
      'https://c.saavncdn.com/267/Dance-Monkey-English-2019-20191010221833-500x500.jpg',
    duration: 210,
  },
  {
    id: '5',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    url: 'https://your-music-server.com/path/to/sample5.mp3',
    artwork:
      'https://c.saavncdn.com/747/Future-Nostalgia-English-2020-20200327034438-500x500.jpg',
    duration: 220,
  },
];

export const mockAlbums = [
  {
    id: 'album_1',
    name: 'Divide',
    artist: 'Ed Sheeran',
    artwork:
      'https://c.saavncdn.com/092/shape-of-you-english-2017-20170106180334-500x500.jpg',
    songs: [mockTracks[0]],
  },
  {
    id: 'album_2',
    name: 'After Hours',
    artist: 'The Weeknd',
    artwork:
      'https://c.saavncdn.com/433/Blinding-Lights-English-2019-20191129092758-500x500.jpg',
    songs: [mockTracks[1]],
  },
  {
    id: 'album_3',
    name: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
    artist: 'Billie Eilish',
    artwork:
      'https://c.saavncdn.com/947/WHEN-WE-ALL-FALL-ASLEEP-WHERE-DO-WE-GO-English-2019-20190329101955-500x500.jpg',
    songs: [mockTracks[2]],
  },
];

export const mockPlaylists = [
  {
    id: 'playlist_1',
    name: 'Top Hits 2023',
    description: 'The most popular songs right now',
    artwork:
      'https://c.saavncdn.com/editorial/charts_TopHits_149756_20230814225858.jpg',
    songs: [mockTracks[0], mockTracks[1], mockTracks[3]],
  },
  {
    id: 'playlist_2',
    name: 'Chill Vibes',
    description: 'Relax and unwind with these smooth tracks',
    artwork:
      'https://c.saavncdn.com/editorial/logo/charts_WeekendVibes_167119_20230508173632.jpg',
    songs: [mockTracks[2], mockTracks[4]],
  },
];

export const mockArtists = [
  {
    id: 'artist_1',
    name: 'Ed Sheeran',
    image: 'https://c.saavncdn.com/artists/Ed_Sheeran_500x500.jpg',
    description:
      'Edward Christopher Sheeran MBE is an English singer-songwriter.',
    followerCount: '25.5M',
    songs: [mockTracks[0]],
  },
  {
    id: 'artist_2',
    name: 'The Weeknd',
    image: 'https://c.saavncdn.com/artists/The_Weeknd_500x500.jpg',
    description:
      'Abel Makkonen Tesfaye, known professionally as the Weeknd, is a Canadian singer and songwriter.',
    followerCount: '30.2M',
    songs: [mockTracks[1]],
  },
  {
    id: 'artist_3',
    name: 'Billie Eilish',
    image: 'https://c.saavncdn.com/artists/Billie_Eilish_500x500.jpg',
    description:
      "Billie Eilish Pirate Baird O'Connell is an American singer and songwriter.",
    followerCount: '28.7M',
    songs: [mockTracks[2]],
  },
];

export const mockRadios = [
  {
    id: 'radio_1',
    name: '90s Nostalgia',
    type: 'featured',
    description: 'Best hits from the 90s',
    image:
      'https://c.saavncdn.com/editorial/logo/Finally90s_20220311163341.jpg',
    songs: [mockTracks[0], mockTracks[2], mockTracks[4]],
  },
  {
    id: 'radio_2',
    name: 'Ed Sheeran Radio',
    type: 'artist',
    description: 'Songs by Ed Sheeran and similar artists',
    image: 'https://c.saavncdn.com/artists/Ed_Sheeran_500x500.jpg',
    songs: [mockTracks[0], mockTracks[1]],
  },
  {
    id: 'radio_3',
    name: 'Chill Radio',
    type: 'featured',
    description: 'Relax with these smooth tracks',
    image:
      'https://c.saavncdn.com/editorial/logo/charts_WeekendVibes_167119_20230508173632.jpg',
    songs: [mockTracks[3], mockTracks[4]],
  },
];

export const mockResponseFormat = {
  status: 'Success',
  message: 'Data fetched successfully',
  data: null,
};

export const getMockSearchResults = (query, type = 'all') => {
  if (!query) {
    return {...mockResponseFormat, data: []};
  }

  let results = [];

  if (type === 'all' || type === 'songs') {
    const songResults = mockTracks.filter(
      track =>
        track.title.toLowerCase().includes(query.toLowerCase()) ||
        track.artist.toLowerCase().includes(query.toLowerCase()),
    );
    results = [...results, ...songResults];
  }

  if (type === 'all' || type === 'albums') {
    const albumResults = mockAlbums.filter(
      album =>
        album.name.toLowerCase().includes(query.toLowerCase()) ||
        album.artist.toLowerCase().includes(query.toLowerCase()),
    );
    results = [...results, ...albumResults];
  }

  if (type === 'all' || type === 'artists') {
    const artistResults = mockArtists.filter(artist =>
      artist.name.toLowerCase().includes(query.toLowerCase()),
    );
    results = [...results, ...artistResults];
  }

  return {
    ...mockResponseFormat,
    message: `Found ${results.length} results for "${query}"`,
    data: results,
  };
};

export const getMockTrendingSongs = () => {
  return {
    ...mockResponseFormat,
    message: 'Trending songs fetched successfully',
    data: mockTracks.slice(0, 3),
  };
};

export const getMockNewReleases = () => {
  return {
    ...mockResponseFormat,
    message: 'New releases fetched successfully',
    data: [mockTracks[1], mockTracks[4]],
  };
};

export const getMockSongDetails = id => {
  const song = mockTracks.find(track => track.id === id);

  if (!song) {
    return {
      status: 'Failed',
      message: 'Song not found',
      data: null,
    };
  }

  return {
    ...mockResponseFormat,
    message: 'Song details fetched successfully',
    data: song,
  };
};

export const getMockAlbumDetails = id => {
  const foundAlbum = mockAlbums.find(a => a.id === id);

  if (!foundAlbum) {
    return {
      status: 'Failed',
      message: 'Album not found',
      data: null,
    };
  }

  return {
    ...mockResponseFormat,
    message: 'Album details fetched successfully',
    data: foundAlbum,
  };
};

export const getMockPlaylistDetails = id => {
  const foundPlaylist = mockPlaylists.find(p => p.id === id);

  if (!foundPlaylist) {
    return {
      status: 'Failed',
      message: 'Playlist not found',
      data: null,
    };
  }

  return {
    ...mockResponseFormat,
    message: 'Playlist details fetched successfully',
    data: foundPlaylist,
  };
};

export const getMockArtistDetails = id => {
  if (id === 'multiple') {
    return {
      ...mockResponseFormat,
      message: 'Multiple artists fetched successfully',
      data: mockArtists,
    };
  }

  const foundArtist = mockArtists.find(a => a.id === id);

  if (!foundArtist) {
    return {
      status: 'Failed',
      message: 'Artist not found',
      data: null,
    };
  }

  return {
    ...mockResponseFormat,
    message: 'Artist details fetched successfully',
    data: foundArtist,
  };
};
