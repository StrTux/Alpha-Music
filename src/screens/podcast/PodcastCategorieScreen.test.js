import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import PodcastCategorieScreen from './podcastCategorieScreen';

// Mock the navigation and route
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {
        category: {
          id: 'test-category',
          name: 'Spirituality',
          icon: 'flame-outline',
          color: '#1DB954',
        },
      },
    }),
  };
});

// Mock the MusicContext
jest.mock('../../context/MusicContext', () => ({
  useMusic: () => ({
    currentTrack: null,
  }),
}));

// Mock axios instead of fetch
jest.mock('axios');
import axios from 'axios';

describe('PodcastCategorieScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API response
    axios.get.mockResolvedValue({
      status: 200,
      data: {
        status: 'Success',
        message: '✅ Spirituality podcasts fetched successfully',
        data: [
          {
            id: '62',
            title: 'Talking Music',
            subtitle: '',
            type: 'show',
            image: 'http://c.sop.saavncdn.com/Talking-Music-20230310083831.jpg',
            url: 'https://www.jiosaavn.com/shows/talking-music/3/PjReFP-Sguk_',
            explicit: false,
          },
          {
            id: '175427',
            title: 'Such a Drag',
            subtitle: '',
            type: 'show',
            image: 'http://c.sop.saavncdn.com/Such-a-Drag-20220203145825.jpg',
            url: 'https://www.jiosaavn.com/shows/such-a-drag/1/VypzBimFtiI_',
            explicit: true,
          },
        ],
      }
    });
  });

  it('renders loading state initially', async () => {
    const { getByText } = render(<PodcastCategorieScreen />);
    
    expect(getByText('Loading podcasts...')).toBeTruthy();
  });

  it('makes an API call to fetch podcasts for the given category', async () => {
    await act(async () => {
      render(<PodcastCategorieScreen />);
    });
    
    expect(axios.get).toHaveBeenCalledWith(
      'https://strtux-main.vercel.app/podcast/category/Spirituality',
      expect.anything()
    );
  });

  it('displays podcast items after loading', async () => {
    let component;
    
    await act(async () => {
      component = render(<PodcastCategorieScreen />);
    });
    
    await waitFor(() => {
      expect(component.getByText('Talking Music')).toBeTruthy();
      expect(component.getByText('Such a Drag')).toBeTruthy();
    });
  });

  it('displays the category name in the header', async () => {
    const { getByText } = render(<PodcastCategorieScreen />);
    
    expect(getByText('Spirituality Podcasts')).toBeTruthy();
  });

  it('displays error message when API call fails', async () => {
    // Mock a failed API response
    axios.get.mockRejectedValueOnce({
      response: {
        status: 404,
        data: {
          status: 'Failed',
          message: 'Resource not found'
        }
      }
    });

    let component;
    
    await act(async () => {
      component = render(<PodcastCategorieScreen />);
    });
    
    await waitFor(() => {
      expect(component.getByText(/The API endpoint for Spirituality podcasts doesn't exist/)).toBeTruthy();
    });
  });
}); 