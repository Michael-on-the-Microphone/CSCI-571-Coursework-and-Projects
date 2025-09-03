import React, { useState, useEffect } from 'react';

const RelativeTime = ({ date }) => {
  const [timeAgo, setTimeAgo] = useState('');

  const updateRelativeTime = () => {
    const now = new Date();
    const pastDate = new Date(date);
    const diffInSeconds = Math.floor((now - pastDate) / 1000);

    let timeString;

    if (diffInSeconds < 60) {
      timeString = `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      timeString = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      timeString = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      timeString = `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      timeString = `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      timeString = `${months} month${months !== 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      timeString = `${years} year${years !== 1 ? 's' : ''} ago`;
    }

    setTimeAgo(timeString);
  };

  useEffect(() => {
    // Function to determine the appropriate update interval
    const getUpdateInterval = () => {
      const now = new Date();
      const pastDate = new Date(date);
      const diffInSeconds = Math.floor((now - pastDate) / 1000);

      if (diffInSeconds < 3600) { // Less than an hour old
        return 1000; // Update every second
      } else if (diffInSeconds < 86400) { // Less than a day old
        return 60000; // Update every minute
      } else {
        return 3600000; // Update every hour
      }
    };

    // Update immediately when the component mounts
    updateRelativeTime();

    // Initial update interval
    let currentInterval = getUpdateInterval();

    // Set up an interval with the appropriate update frequency
    let intervalId = setInterval(() => {
      // Update the display
      updateRelativeTime();

      // Check if we need to adjust the interval
      const newInterval = getUpdateInterval();
      if (newInterval !== currentInterval) {
        // If the interval needs to change, clear and reset it
        clearInterval(intervalId);
        currentInterval = newInterval;
        intervalId = setInterval(updateRelativeTime, currentInterval);
      }
    }, currentInterval);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [date]);

  return <span title={new Date(date).toLocaleString()}>{timeAgo}</span>;
};

export default RelativeTime;
