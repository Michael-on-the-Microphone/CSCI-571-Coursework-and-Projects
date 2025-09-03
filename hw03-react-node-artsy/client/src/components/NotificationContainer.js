import React, { useState, useEffect } from 'react';
import Notification from './Notification';

const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for custom notification events
    const handleNotification = (event) => {
      const { type, message } = event.detail;
      addNotification(type, message);
    };

    window.addEventListener('notification', handleNotification);

    return () => {
      window.removeEventListener('notification', handleNotification);
    };
  }, []);

  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px', // Consistent spacing between notifications
        maxWidth: '300px', // Match the width in Notification component
        width: 'calc(100% - 40px)' // Responsive width with margins
      }}
    >
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
