import React, { createContext, useState, useEffect, useContext } from 'react';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';
import { updateFavorites } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      console.log('Registering user with data:', userData);
      setLoading(true);
      setError(null);

      console.log('Sending registration request to /api/register');
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      console.log('Registration response status:', response.status);
      const data = await response.json();
      console.log('Registration response data:', data);

      if (!response.ok) {
        console.error('Registration failed:', data.error);
        // Return the error directly instead of throwing
        return { success: false, error: data.error || 'Registration failed' };
      }

      console.log('Registration successful, setting user data');
      setUser(data);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      console.log('Logging in with credentials:', credentials);
      setLoading(true);
      setError(null);

      console.log('Sending login request to /api/login');
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        console.error('Login failed:', data.error);
        // Return the error directly instead of throwing
        return { success: false, error: data.error || 'Login failed' };
      }

      console.log('Login successful, setting user data');
      setUser(data);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      showSuccessNotification('Logged out successfully');
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete user account
  const deleteAccount = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/deleteUser', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      setUser(null);
      showErrorNotification('Account deleted');
      return { success: true };
    } catch (err) {
      console.error('Delete account error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Add artist to favorites
  const addToFavorites = async (artist) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // Use the API service to fetch complete artist data and update favorites
      const data = await updateFavorites('add', artist);

      // Update user with new favorites
      setUser(prevUser => ({
        ...prevUser,
        favorites: data.favorites
      }));

      showSuccessNotification('Added to favorites');
      return { success: true };
    } catch (err) {
      console.error('Add to favorites error:', err);
      return { success: false, error: err.message };
    }
  };

  // Remove artist from favorites
  const removeFromFavorites = async (artistId) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // Use the API service to update favorites
      const data = await updateFavorites('remove', artistId);

      // Update user with new favorites
      setUser(prevUser => ({
        ...prevUser,
        favorites: data.favorites
      }));

      showErrorNotification('Removed from favorites');
      return { success: true };
    } catch (err) {
      console.error('Remove from favorites error:', err);
      return { success: false, error: err.message };
    }
  };

  // Check if an artist is in favorites
  const isInFavorites = (artistId) => {
    if (!user || !user.favorites) return false;
    return user.favorites.some(fav => fav.artistId === artistId);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    deleteAccount,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
