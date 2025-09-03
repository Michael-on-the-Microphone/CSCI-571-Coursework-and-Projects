/**
 * Show a notification
 * @param {string} type - The type of notification ('success', 'danger', 'warning', 'info')
 * @param {string} message - The message to display
 */
export const showNotification = (type, message) => {
  // Dispatch a custom event that will be caught by the NotificationContainer
  const event = new CustomEvent('notification', {
    detail: { type, message }
  });
  
  window.dispatchEvent(event);
};

// Helper functions for common notifications
export const showSuccessNotification = (message) => {
  showNotification('success', message);
};

export const showErrorNotification = (message) => {
  showNotification('danger', message);
};

export const showWarningNotification = (message) => {
  showNotification('warning', message);
};

export const showInfoNotification = (message) => {
  showNotification('info', message);
};
