/**
 * Project structure constants
 * This file defines the structure of the project and provides paths to different parts of the app
 */

export const FOLDER_STRUCTURE = {
  // Root folders
  ROOT: {
    ASSETS: 'assets',
    SRC: 'src',
  },

  // Source folders
  SRC: {
    COMPONENTS: 'components',
    SCREENS: 'screens',
    NAVIGATION: 'navigation',
    SERVICES: 'services',
    UTILS: 'utils',
    HOOKS: 'hooks',
    CONTEXT: 'context',
    CONSTANTS: 'constants',
    STYLES: 'styles',
    DATA: 'data',
  },

  // Component folders
  COMPONENTS: {
    COMMON: 'common',
    PLAYER: 'player',
    LISTS: 'lists',
    CARDS: 'cards',
    LOADERS: 'loaders',
    BUTTONS: 'buttons',
    MODALS: 'modals',
    FORMS: 'forms',
  },

  // Screen folders
  SCREENS: {
    AUTH: 'auth',
    HOME: 'home',
    SEARCH: 'search',
    LIBRARY: 'library',
    SETTINGS: 'settings',
    PLAYER: 'player',
    DETAILS: 'details',
  },
};

export const API_ENDPOINTS = {
  // Search endpoints
  SEARCH: {
    ALL: '/search',
    SONGS: '/search/songs',
    ALBUMS: '/search/albums',
  },

  // Song endpoints
  SONG: {
    DETAILS: '/song',
    MULTIPLE: '/song', // With multiple IDs
  },

  // Album endpoints
  ALBUM: {
    DETAILS: '/album',
  },

  // Artist endpoints
  ARTIST: {
    DETAILS: '/artist',
    SONGS: '/artist/songs',
    ALBUMS: '/artist/albums',
  },

  // Playlist endpoints
  PLAYLIST: {
    DETAILS: '/playlist',
  },

  // Radio endpoints
  RADIO: {
    FEATURED: '/radio/featured',
    ARTIST: '/radio/artist',
  },

  // Home data - may need to be constructed from multiple endpoints

  // Artists top
  ARTISTS_TOP: '/artists/top',
};

export default {
  FOLDER_STRUCTURE,
  API_ENDPOINTS,
};
