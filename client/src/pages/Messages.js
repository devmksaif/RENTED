import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getConversations, getProductById } from '../services/api';
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
    try {
      setIsLoading(true);
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setIsLoading(false);
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

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={fetchConversations}>Try Again</button>
        </div>
      )}

      <div className="conversations-list">
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conversation => (
            <Link
              to={`/messages/${conversation._id}/${conversation.otherUser._id}`}
              key={conversation._id}
              className="conversation-card"
            >
              <div className="user-avatar">
                <i className="fas fa-user"></i>
                {conversation.otherUser.isOnline && (
                  <span className="online-indicator"></span>
                )}
              </div>
              <div className="conversation-content">
                <div className="conversation-header">
                  <h3>{conversation.otherUser.name}</h3>
                  <span className="last-message-time">
                    {new Date(conversation.lastMessage?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="last-message">
                  {conversation.lastMessage?.content || 'No messages yet'}
                </p>
              </div>
              {conversation.unreadCount > 0 && (
                <div className="unread-badge">
                  {conversation.unreadCount}
                </div>
              )}
            </Link>
          ))
        ) : (
          <div className="no-conversations">
            <i className="fas fa-comments"></i>
            <h2>No conversations found</h2>
            <p>
              {searchTerm 
                ? "No conversations match your search" 
                : "Start a conversation by browsing items"}
            </p>
            {!searchTerm && (
              <Link to="/" className="browse-button">
                Browse Items
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages;