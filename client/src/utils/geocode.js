import axios from 'axios';

/**
 * Reverse geocodes latitude and longitude to a human-readable address
 * Uses OpenStreetMap Nominatim API (Free, no key required)
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'json',
        lat,
        lon: lng,
        zoom: 18,
        addressdetails: 1,
      },
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        // Nominatim requests a generic user agent identifying the app to avoid rate limits
        'User-Agent': 'UrbanAlert-CivicApp/1.0' 
      }
    });

    if (response.data && response.data.display_name) {
      // Simplify address a bit if possible, otherwise use display_name
      return response.data.display_name;
    }
    return '';
  } catch (error) {
    console.error('Geocoding error:', error);
    return '';
  }
};
