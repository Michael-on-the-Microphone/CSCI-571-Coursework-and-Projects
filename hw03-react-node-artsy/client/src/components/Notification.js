import React, { useEffect } from 'react';

const Notification = ({ id, type, message, onClose }) => {
  useEffect(() => {
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  // Define custom styles based on notification type
  const getCustomStyles = () => {
    if (type === 'success') {
      return {
        backgroundColor: '#d4edda',
        borderColor: '#c3e6cb',
        color: '#155724'
      };
    } else if (type === 'danger') {
      return {
        backgroundColor: '#f8d7da',
        borderColor: '#f5c6cb',
        color: '#721c24'
      };
    }
    return {};
  };

  return (
    <div
      className="d-flex justify-content-between align-items-center"
      style={{
        width: '100%',
        maxWidth: '300px',
        fontSize: '0.875rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.25rem',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        ...getCustomStyles()
      }}
    >
      <span>{message}</span>
      <button
        type="button"
        className="btn-close"
        style={{
          fontSize: '0.75rem',
          padding: '0.25rem',
          opacity: '0.8',
          minWidth: '30px',
          minHeight: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label="Close"
        onClick={() => onClose(id)}
      />
    </div>
  );
};

export default Notification;
