import { io } from 'socket.io-client';

const API_URL =  "http://localhost:4000";

let socket;
let messageListeners = [];

export const initializeSocket = (userId) => {
  if (!userId) return null;
  
  // Close existing socket if any
  if (socket) socket.close();
  
  // Create new socket connection
  socket = io(API_URL, {
 
    autoConnect: true,
    reconnection : true
  });
  
  // Handle connection
  socket.on('connect', () => {
    console.log('Socket connected');
    
    // Authenticate with user ID
    socket.emit('authenticate', userId);
  });
  
  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  // Set up global message handler
  socket.on('new_message', (data) => {
    console.log('New message received:', data);
    // Notify all registered listeners
    messageListeners.forEach(listener => listener(data));
  });
  
  return socket;
};

export const addMessageListener = (callback) => {
  messageListeners.push(callback);
  return () => {
    messageListeners = messageListeners.filter(cb => cb !== callback);
  };
};

export const getSocket = () => socket;

export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
    messageListeners = [];
  }
};

export const sendMessage = (recipientId, content, conversationId) => {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }
  
  console.log('Sending message via socket:', { recipientId, content, conversationId });
  socket.emit('send_message', {
    recipientId,
    content,
    conversationId
  });
};

export const sendTypingIndicator = (conversationId, recipientId) => {
  if (!socket) return;
  
  socket.emit('typing', {
    conversationId,
    recipientId
  });
};

export default {
  initializeSocket,
  getSocket,
  closeSocket,
  sendMessage,
  sendTypingIndicator
};