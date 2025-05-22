import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMessages, sendMessage, markConversationAsRead } from '../services/api';
import '../styles/MessageDetail.css';
import { initializeSocket, getSocket, sendMessage as sm } from '../services/socket';

function MessageDetail() {
  const { id, rec } = useParams();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    try {
      // Parse user object properly
      const user = JSON.parse(localStorage.getItem("user") || '{}');
      fetchMessages();
      
      // Initialize socket with user ID
      if (user && user.id) {
        console.log(user)
        const socketInstance = initializeSocket(user.id);
        
        // Set up listener for new messages
        if (socketInstance) {
          socketInstance.on('new_message', (data) => {
            if (data.conversationId === id) {
              // Add the new message to the messages array
              setMessages(prev => [...prev, {
                _id: Date.now(), // Temporary ID
                content: data.content,
                sender: data.sender,
                isCurrentUser: false,
                createdAt: data.createdAt || new Date(),
                isRead: false
              }]);
              
              // Mark conversation as read
              markConversationAsRead(id);
              
              // Scroll to bottom
              scrollToBottom();
            }
          });
        }
      }
    } catch (error) {
      console.error('Error setting up socket:', error);
    }
    
    // Clean up socket listeners on unmount
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('new_message');
      }
    };
  }, [id, rec]);
 

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const data = await getMessages(id);
      setConversation(data.conversation);
      setMessages(data.messages);
      await markConversationAsRead(id);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const response = await sendMessage(rec, newMessage.trim());
      
      // Send message through socket
      sm(rec, newMessage.trim(), id);
      
      setMessages(prev => [...prev, response]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="message-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="message-detail-container">
      <div className="message-detail-header">
        <Link to="/messages" className="back-button">
          <i className="fas fa-arrow-left"></i>
        </Link>
        <div className="chat-user-info">
          <h2>{conversation?.otherUser.name}</h2>
          {conversation?.product && (
            <Link to={`/product/${conversation.product._id}`} className="product-link">
              View Product
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={fetchMessages}>Try Again</button>
        </div>
      )}

      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={message._id || index}
            className={`message ${message.isCurrentUser ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              <p>{message.content}</p>
              <span className="message-time">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
              {message.isCurrentUser && (
                <span className="read-status">
                  {message.isRead ? (
                    <i className="fas fa-check-double"></i>
                  ) : (
                    <i className="fas fa-check"></i>
                  )}
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isSending}
        />
        <button type="submit" disabled={!newMessage.trim() || isSending}>
          {isSending ? (
            <div className="button-spinner"></div>
          ) : (
            <i className="fas fa-paper-plane"></i>
          )}
        </button>
      </form>
    </div>
  );
}

export default MessageDetail;