import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMessages, sendMessage, markConversationAsRead } from '../services/api';
import { getSocket, sendMessage as socketSendMessage, sendTypingIndicator } from '../services/socket';
import '../styles/MessageDetail.css';

function MessageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    
    // Mark conversation as read when component mounts
    if (id) {
      markConversationAsRead(id).catch(err => 
        console.error('Error marking conversation as read:', err)
      );
    }
    
    // Set up socket listeners
    const socket = getSocket();
    if (socket) {
      // Listen for new messages
      socket.on('new_message', handleNewMessage);
      
      // Listen for typing indicators
      socket.on('typing', handleTypingIndicator);
      
      // Listen for user status changes
      socket.on('user_status', handleUserStatusChange);
    }
    
    return () => {
      // Clean up socket listeners
      if (socket) {
        socket.off('new_message', handleNewMessage);
        socket.off('typing', handleTypingIndicator);
        socket.off('user_status', handleUserStatusChange);
      }
    };
  }, [id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages, isTyping]);

  const fetchMessages = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const data = await getMessages(id);
      setMessages(data.messages);
      setConversation(data.conversation);
      setError(null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = (data) => {
    // Only process messages for the current conversation
    if (data.conversationId === id) {
      // Add the new message to the messages array
      setMessages(prevMessages => [
        ...prevMessages,
        {
          _id: Date.now().toString(), // Temporary ID until refresh
          content: data.content,
          sender: { _id: data.sender },
          createdAt: data.createdAt,
          isCurrentUser: false
        }
      ]);
      
      // Mark the conversation as read
      markConversationAsRead(id).catch(err => 
        console.error('Error marking conversation as read:', err)
      );
    }
  };

  const handleTypingIndicator = (data) => {
    // Only show typing indicator for the current conversation
    if (data.conversationId === id) {
      setIsTyping(true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Hide typing indicator after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  };

  const handleUserStatusChange = (data) => {
    // Update user status if it's the other user in this conversation
    if (conversation && conversation.otherUser._id === data.userId) {
      setConversation(prev => ({
        ...prev,
        otherUser: {
          ...prev.otherUser,
          isOnline: data.status === 'online'
        }
      }));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setIsSending(true);
      const recipientId = conversation.otherUser._id;
      const response = await sendMessage(recipientId, newMessage);
      
      // Also send via socket for real-time delivery
      socketSendMessage(recipientId, newMessage, id);
      
      // Add message to UI
      const tempMessage = {
        _id: response._id || Date.now().toString(),
        content: newMessage,
        sender: { _id: 'currentUser' },
        createdAt: new Date().toISOString(),
        isCurrentUser: true
      };
      
      setMessages([...messages, tempMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator via socket
    if (conversation && conversation.otherUser) {
      sendTypingIndicator(id, conversation.otherUser._id);
    }
  };

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDay = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  // Group messages by day
  const groupMessagesByDay = () => {
    const groups = {};
    
    messages.forEach(message => {
      const day = new Date(message.createdAt).toDateString();
      if (!groups[day]) {
        groups[day] = [];
      }
      groups[day].push(message);
    });
    
    return Object.entries(groups).map(([day, msgs]) => ({
      day,
      date: new Date(day),
      messages: msgs
    })).sort((a, b) => a.date - b.date);
  };

  if (isLoading && !conversation) {
    return (
      <div className="message-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="message-detail-container">
      <div className="message-detail-header">
        <Link to="/messages" className="back-button">
          <i className="fas fa-arrow-left"></i>
        </Link>
        
        {conversation && (
          <div className="conversation-user">
            <div className="user-avatar">
              {conversation.otherUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <h2>{conversation.otherUser.name}</h2>
              <span className="user-status">
                {conversation.otherUser.isOnline ? (
                  <><span className="status-dot online"></span> Online</>
                ) : (
                  <><span className="status-dot offline"></span> Offline</>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {error && <div className="message-detail-error">{error}</div>}

      <div className="messages-list" ref={messageListRef}>
        {groupMessagesByDay().map(group => (
          <div key={group.day} className="message-day-group">
            <div className="message-day-divider">
              <span>{formatMessageDay(group.date)}</span>
            </div>
            
            {group.messages.map(message => (
              <div 
                key={message._id} 
                className={`message-bubble ${message.sender._id === 'currentUser' || message.isCurrentUser ? 'sent' : 'received'}`}
              >
                <div className="message-content">{message.content}</div>
                <div className="message-time">{formatMessageDate(message.createdAt)}</div>
              </div>
            ))}
          </div>
        ))}
        
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleInputChange}
          disabled={isSending}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={isSending || !newMessage.trim()}
        >
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