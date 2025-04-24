import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import '../styles/NotificationDropdown.css';

function NotificationDropdown({ onClose }) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getIconClass = (type) => {
    switch (type) {
      case 'info':
        return 'fas fa-info-circle';
      case 'success':
        return 'fas fa-check-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'error':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-bell';
    }
  };

  const handleNotificationClick = (id) => {
    markAsRead(id);
    // Additional logic to navigate or show details could be added here
  };

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>Notifications</h3>
        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div 
              key={notification._id} 
              className={`notification-item ${notification.read ? '' : 'unread'}`}
              onClick={() => handleNotificationClick(notification._id)}
            >
              <div className={`notification-icon ${notification.type}`}>
                <i className={getIconClass(notification.type)}></i>
              </div>
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">{formatTime(notification.createdAt)}</span>
              </div>
              {!notification.read && <div className="unread-indicator"></div>}
            </div>
          ))
        ) : (
          <div className="no-notifications">
            <div className="no-notifications-icon">
              <i className="fas fa-bell-slash"></i>
            </div>
            <p>No notifications yet</p>
          </div>
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="notification-footer">
          <button className="mark-all-read" onClick={markAllAsRead}>
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;