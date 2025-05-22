import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getConversations } from '../services/api';
import '../styles/Messages.css';

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const data = await getConversations();
      setConversations(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conversation => 
    conversation.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="messages-loading">
        <div className="loading-spinner"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h1>Messages</h1>
        <div className="search-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {error && <div className="messages-error">{error}</div>}

      {!error && filteredConversations.length === 0 && (
        <div className="no-conversations">
          <div className="no-conversations-icon">
            <i className="fas fa-comments"></i>
          </div>
          <h3>No conversations yet</h3>
          <p>
            {searchTerm 
              ? "No conversations match your search." 
              : "Start messaging other users to see your conversations here."}
          </p>
        </div>
      )}

      <div className="conversations-list">
        {filteredConversations.map(conversation => (
          <Link 
            to={`/messages/${conversation._id}`} 
            key={conversation._id} 
            className={`conversation-item ${conversation.unreadCount > 0 ? 'unread' : ''}`}
          >
            <div className="conversation-avatar">
              {conversation.otherUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="conversation-content">
              <div className="conversation-header">
                <h3 className="conversation-name">{conversation.otherUser.name}</h3>
                <span className="conversation-time">{formatDate(conversation.lastMessage.createdAt)}</span>
              </div>
              <div className="conversation-preview">
                <p className="conversation-last-message">
                  {conversation.lastMessage.content.length > 50
                    ? `${conversation.lastMessage.content.substring(0, 50)}...`
                    : conversation.lastMessage.content}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="unread-badge">{conversation.unreadCount}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Messages;