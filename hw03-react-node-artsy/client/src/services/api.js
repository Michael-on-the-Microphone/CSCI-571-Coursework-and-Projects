// API service for making requests to the backend

// Get the base URL for API calls
const getBaseUrl = () => {
  // Use absolute URL for API calls when deployed to App Engine
  if (window.location.hostname.includes('appspot.com')) {
    return window.location.origin;
  }
  // Use relative URL for local development
  return '';
};

// Create a reusable fetch function with error handling
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    console.log(`Making API request to: ${url}`);

    // Add default headers
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the response as JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed: ${error.message}`);
    throw error;
  }
};

// API functions
export const searchArtists = async (query) => {
  const baseUrl = getBaseUrl();
  const encodedQuery = encodeURIComponent(query);
  const url = `${baseUrl}/api/searchArtists?query=${encodedQuery}`;

  return fetchWithErrorHandling(url);
};

export const fetchArtistData = async (artistId) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/fetchArtistData?artistId=${artistId}`;

  return fetchWithErrorHandling(url);
};

export const fetchArtworkData = async (artistId) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/fetchArtworkData?artistId=${artistId}`;

  return fetchWithErrorHandling(url);
};

export const fetchCategories = async (artworkId) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/fetchCategories?artworkId=${artworkId}`;

  return fetchWithErrorHandling(url);
};

export const getSimilarArtistData = async (artistId) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/getSimilarArtistData?artistId=${artistId}`;

  return fetchWithErrorHandling(url);
};

export const updateFavorites = async (action, artist) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/updateFavorites`;

  // If adding a favorite, fetch complete artist data first
  if (action === 'add') {
    try {
      // Fetch complete artist data to ensure we have all fields
      const artistData = await fetchArtistData(artist.id);

      const payload = {
        action,
        artist: {
          artistId: artist.id,
          name: artist.name,
          thumbnail: artist.image,
          birthday: artistData.birthday,
          deathday: artistData.deathday,
          nationality: artistData.nationality
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update favorites');
      }

      return data;
    } catch (error) {
      console.error('Error updating favorites:', error);
      throw error;
    }
  } else {
    // For removing favorites, use the original approach
    const payload = { action, artistId: artist };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update favorites');
    }

    return data;
  }

  // This code is now handled in the if/else blocks above
};

export default {
  searchArtists,
  fetchArtistData,
  fetchArtworkData,
  fetchCategories,
  getSimilarArtistData,
  updateFavorites
};
