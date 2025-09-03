const fetch = require('node-fetch');

let ARTSY_TOKEN = null;
const ARTSY_API_BASE_URL = 'https://api.artsy.net/api';
const ARTSY_CLIENT_ID = 'e4837ed4288e90964c88';
const ARTSY_CLIENT_SECRET = '28cf5dabdbc7522155b01add560fc196';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User'); // Ensure this path is correct

const JWT_SECRET = process.env.JWT_SECRET || 'secret'; // You can also load this from .env


async function getArtsyToken() {
  if (ARTSY_TOKEN) {
    console.log('Using cached Artsy token');
    return ARTSY_TOKEN;
  }

  console.log('Requesting new Artsy token...');
  const tokenUrl = `${ARTSY_API_BASE_URL}/tokens/xapp_token`;
  const params = new URLSearchParams({
    client_id: ARTSY_CLIENT_ID,
    client_secret: ARTSY_CLIENT_SECRET
  });

  try {
    const url = `${tokenUrl}?${params.toString()}`;
    console.log('Token request URL:', url);

    let response = await fetch(url, { method: 'POST' });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch Artsy token: Status ${response.status}, Response: ${errorText}`);
      throw new Error(`Failed to fetch Artsy token: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Token received successfully');
    ARTSY_TOKEN = data.token;
    return ARTSY_TOKEN;
  } catch (error) {
    console.error('Error getting Artsy token:', error);
    throw error;
  }
}

module.exports = {
  searchArtists: async (req, res) => {
    console.log('searchArtists called with query:', req.query);
    const { query } = req.query;

    if (!query) {
      console.log('Query parameter missing');
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
      console.log('Getting Artsy token...');
      const token = await getArtsyToken();
      console.log('Token obtained successfully');

      const headers = { 'X-Xapp-Token': token };
      const params = new URLSearchParams({ q: query, type: 'artist', size: '10' });
      const url = `${ARTSY_API_BASE_URL}/search?${params.toString()}`;
      console.log('Fetching from Artsy API:', url);

      let response = await fetch(url, { headers });

      if (!response.ok) {
        console.log('First API call failed with status:', response.status);
        // Retry with new token
        ARTSY_TOKEN = null;
        console.log('Getting new Artsy token...');
        const newToken = await getArtsyToken();
        console.log('New token obtained, retrying API call');

        response = await fetch(url, {
          headers: { 'X-Xapp-Token': newToken }
        });

        if (!response.ok) {
          console.error(`Artsy API error on retry: ${response.status}`);
          throw new Error(`Artsy API error: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('API response received, processing results');

      const results = (data._embedded?.results || [])
        .filter(r => r.og_type === 'artist')
        .map(r => ({
          id: r._links.self.href.split('/').pop(),
          name: r.title,
          image: r._links.thumbnail?.href
        }));

      console.log(`Found ${results.length} artists`);
      res.json({ artists: results });
    } catch (error) {
      console.error('Search artists error:', error);
      res.status(500).json({ error: `Failed to search artists: ${error.message}` });
    }
  },

  fetchArtistData: async (req, res) => {
    const { artistId } = req.query;
    try {
      const token = await getArtsyToken();
      const response = await fetch(`${ARTSY_API_BASE_URL}/artists/${artistId}`, {
        headers: { 'X-Xapp-Token': token }
      });

      if (!response.ok) {
        throw new Error(`Error fetching artist ${artistId}`);
      }

      const artist = await response.json();
      res.json(artist);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  fetchArtworkData: async (req, res) => {
    const { artistId } = req.query;
    try {
      const token = await getArtsyToken();
      const params = new URLSearchParams({ artist_id: artistId, size: '10' });
      const response = await fetch(`${ARTSY_API_BASE_URL}/artworks?${params.toString()}`, {
        headers: { 'X-Xapp-Token': token }
      });

      if (!response.ok) {
        throw new Error(`Error fetching artworks for artist ${artistId}`);
      }

      const data = await response.json();
      const artworks = (data._embedded?.artworks || []).map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        date: artwork.date,
        image: artwork._links.thumbnail?.href
      }));

      res.json({ artistId, artworks });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  fetchCategories: async (req, res) => {
    const { artworkId } = req.query;
    try {
      const token = await getArtsyToken();
      const params = new URLSearchParams({ artwork_id: artworkId });
      const response = await fetch(`${ARTSY_API_BASE_URL}/genes?${params.toString()}`, {
        headers: { 'X-Xapp-Token': token }
      });

      if (!response.ok) {
        throw new Error(`Error fetching categories for artwork ${artworkId}`);
      }

      const data = await response.json();
      const categories = (data._embedded?.genes || []).map(gene => ({
        name: gene.name,
        image: gene._links.thumbnail?.href
      }));

      res.json({ artworkId, categories });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getSimilarArtistData: async (req, res) => {
    const { artistId } = req.query;

    try {
      const token = await getArtsyToken();
      const params = new URLSearchParams({ similar_to_artist_id: artistId, size: '10' });
      const response = await fetch(`${ARTSY_API_BASE_URL}/artists?${params.toString()}`, {
        headers: { 'X-Xapp-Token': token }
      });

      if (!response.ok) {
        throw new Error(`Error fetching similar artists for artist ${artistId}`);
      }

      const data = await response.json();
      const similarArtists = (data._embedded?.artists || []).map(artist => ({
        id: artist.id,
        name: artist.name,
        image: artist._links?.thumbnail?.href,
        birthday: artist.birthday,
        deathday: artist.deathday,
        nationality: artist.nationality
      }));

      res.json({ artistId, similarArtists });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateFavorites: async (req, res) => {
    console.log('updateFavorites called with body:', req.body);
    const token = req.cookies.token;
    const { action, artist, artistId } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      if (action === 'add' && artist) {
        console.log('Adding artist to favorites:', artist);
        const alreadyFav = user.favorites.some(fav => fav.artistId === artist.artistId);
        if (!alreadyFav) {
          user.favorites.unshift({
            artistId: artist.artistId,
            name: artist.name,
            thumbnail: artist.thumbnail,
            birthday: artist.birthday,
            deathday: artist.deathday,
            nationality: artist.nationality,
            addedAt: new Date()
          });
        }
      } else if (action === 'remove' && artistId) {
        console.log('Removing artist from favorites:', artistId);
        user.favorites = user.favorites.filter(fav => fav.artistId !== artistId);
      } else {
        return res.status(400).json({ error: 'Invalid action or missing data.' });
      }

      await user.save();
      console.log('User favorites updated, new count:', user.favorites.length);

      res.json({
        message: action === 'add'
          ? `Artist ${artist.artistId} added to favorites.`
          : `Artist ${artistId} removed from favorites.`,
        favorites: user.favorites
      });
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token.' });
    }
  },

  login: async (req, res) => {
    console.log('Login endpoint called with body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
      console.log('Finding user with email:', email);
      const user = await User.findOne({ email });
      if (!user) {
        console.log('Login failed: User not found');
        console.log('Sending 401 status with error message');
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      console.log('Comparing passwords');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('Login failed: Password does not match');
        console.log('Sending 401 status with error message');
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      console.log('Creating JWT token');
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

      console.log('Setting cookie');
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 3600000
      });
      console.log('Cookie set successfully');

      console.log('Login successful, sending response');
      res.json({
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        favorites: user.favorites
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: `Server error: ${err.message}` });
    }
  },

  register: async (req, res) => {
    console.log('Register endpoint called with body:', req.body);
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      console.log('Registration failed: Missing required fields');
      return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
      console.log('Checking if user already exists with email:', email);
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('Registration failed: Email already in use');
        // Add more detailed logging
        console.log('Sending 409 status with error message');
        return res.status(409).json({ error: 'Email already in use.' });
      }

      console.log('Hashing password and creating Gravatar URL');
      const hashedPassword = await bcrypt.hash(password, 10);
      const hash = crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
      const profileImageUrl = `https://www.gravatar.com/avatar/${hash}`;

      console.log('Creating new user document');
      const user = new User({
        fullname,
        email,
        password: hashedPassword,
        profileImageUrl
      });

      console.log('Saving user to database');
      await user.save();
      console.log('User saved successfully with ID:', user._id);

      console.log('Creating JWT token');
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

      console.log('Setting cookie');
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 3600000
      });
      console.log('Cookie set successfully');

      console.log('Sending response');
      res.json({
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        favorites: user.favorites
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: `Server error: ${err.message}` });
    }
  },

  logout: (req, res) => {
    console.log('Logout endpoint called');
    res.clearCookie('token');
    console.log('Cookie cleared');
    res.json({ message: 'Logged out successfully' });
  },

  deleteUser: async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ error: 'Not authenticated.' });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      await User.findByIdAndDelete(user._id);
      res.clearCookie('token');
      console.log('Cookie cleared for deleted user');
      res.json({ message: 'User deleted successfully.' });
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token.' });
    }
  },

  me: async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ error: 'Not authenticated.' });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      res.json({
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        favorites: user.favorites
      });
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token.' });
    }
  }
};
